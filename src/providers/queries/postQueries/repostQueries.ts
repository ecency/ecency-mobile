import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBroadcastMutation, getRebloggedByQueryOptions } from '@ecency/sdk';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { get } from 'lodash';
import QUERIES from '../queryKeys';
import { useAppSelector } from '../../../hooks';
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';
import { getDigitPinCode } from '../../hive/dhive';
import { PointActivityIds } from '../../ecency/ecency.types';
import { useUserActivityMutation } from '../pointQueries';
import { makeJsonMetadata, makeOptions } from '../../../utils/editor';
import { selectCurrentAccount, selectPin } from '../../../redux/selectors';
import authType from '../../../constants/authType';
import { decryptKey } from '../../../utils/crypto';
import { mapAuthTypeToLoginType } from '../../../utils/authMapper';

/** hook used to return post reblogs using SDK */
export const useGetReblogsQuery = (author: string, permlink: string, enabled = true) => {
  const sdkOptions = getRebloggedByQueryOptions(author, permlink);
  const query = useQuery<string[]>({
    ...sdkOptions,
    // Override queryKey to keep local cache key stable
    queryKey: [QUERIES.POST.GET_REBLOGS, author, permlink],
    initialData: [],
    initialDataUpdatedAt: 0, // treat initialData as stale so it refetches immediately
    gcTime: 30 * 60 * 1000, // keeps cache for 30 minutes
    enabled: enabled && !!author && !!permlink, // Only fetch when enabled and valid params
  });

  return query;
};

export function useReblogMutation(author: string, permlink: string) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  const userActivityMutation = useUserActivityMutation();

  // Prepare auth credentials with guards
  const digitPinCode = pinHash ? getDigitPinCode(pinHash) : '';
  const isHiveSigner =
    currentAccount?.local?.authType === authType.STEEM_CONNECT ||
    currentAccount?.local?.authType === authType.HIVE_AUTH;

  const accessToken =
    isHiveSigner && currentAccount?.local?.accessToken && digitPinCode
      ? decryptKey(currentAccount.local.accessToken, digitPinCode)
      : undefined;
  const postingKey =
    !isHiveSigner && currentAccount?.local?.postingKey && digitPinCode
      ? decryptKey(currentAccount.local.postingKey, digitPinCode)
      : undefined;

  const auth = {
    accessToken,
    postingKey,
    loginType: mapAuthTypeToLoginType(currentAccount.local.authType),
  };

  const broadcastMutation = useBroadcastMutation<{ undo: boolean }>(
    [QUERIES.POST.REBLOG_POST, author, permlink],
    currentAccount?.name || '',
    ({ undo }) => [
      [
        'custom_json',
        {
          required_auths: [],
          required_posting_auths: [currentAccount?.name || ''],
          id: 'follow',
          json: JSON.stringify([
            'reblog',
            {
              account: currentAccount?.name || '',
              author,
              permlink,
              delete: undo ? 'delete' : undefined,
            },
          ]),
        },
      ],
    ],
    () => {}, // onSuccess callback
    auth,
  );

  return useMutation({
    mutationKey: [QUERIES.POST.REBLOG_POST],
    mutationFn: async ({ undo }: { undo: boolean }) => {
      if (!author || !permlink || !currentAccount) {
        throw new Error('Not enough data to reblog post');
      }

      // Validate decrypted credentials
      if (isHiveSigner && !accessToken) {
        throw new Error('Failed to decrypt access token. Please check your PIN.');
      }
      if (!isHiveSigner && !postingKey) {
        throw new Error('Failed to decrypt posting key. Please check your PIN.');
      }

      const resp = await broadcastMutation.mutateAsync({ undo });

      // track user activity points ty=130
      userActivityMutation.mutate({
        pointsTy: PointActivityIds.REBLOG,
        transactionId: (resp as any)?.id,
      });

      return resp;
    },
    retry: 3,

    onSuccess: (resp, vars) => {
      console.log('reblog response', resp);
      // update reblogs cache
      queryClient.setQueryData<ReturnType<typeof useGetReblogsQuery>['data']>(
        [QUERIES.POST.GET_REBLOGS, author, permlink],
        (data) => {
          if (!data || !resp) {
            return data;
          }

          const username = currentAccount?.name || currentAccount?.username;
          if (!username) {
            return data;
          }
          const _curIndex = data.indexOf(username);
          if (vars.undo) {
            if (_curIndex >= 0) {
              data.splice(_curIndex, 1);
            }
          } else if (_curIndex < 0) {
            data.splice(0, 0, username);
          }

          return [...data] as ReturnType<typeof useGetReblogsQuery>['data'];
        },
      );

      // Update cached reblog count after success
      const entryKey = ['posts', 'entry', `/@${author}/${permlink}`];
      queryClient.setQueryData<any>(entryKey, (oldData) => {
        if (!oldData) {
          return oldData;
        }
        const delta = vars.undo ? -1 : 1;
        return {
          ...oldData,
          reblogs: Math.max(0, (oldData.reblogs ?? 0) + delta),
        };
      });

      // Also invalidate to fetch authoritative data
      queryClient.invalidateQueries({
        queryKey: ['posts', 'entry', `/@${author}/${permlink}`],
      });

      // Invalidate account posts query to show added/removed reblog in blog and reblog filters
      // SDK query key structure: ['posts', 'account-posts', username, filter, ...]
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' &&
          query.queryKey[1] === 'account-posts' &&
          query.queryKey[2] === currentAccount?.name &&
          ['blog', 'reblog'].includes(String(query.queryKey[3])),
      });
    },
    onError: (error) => {
      if (String(get(error, 'jse_shortmsg', '')).indexOf('has already reblogged') > -1) {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.already_rebloged',
            }),
          ),
        );
      } else {
        if (error && error.jse_shortmsg?.split(': ')[1]?.includes('wait to transact')) {
          // when RC is not enough, offer boosting account
          dispatch(setRcOffer(true));
        } else {
          // when other errors
          dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        }
      }
    },
  });
}

export function useCrossPostMutation() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  const userActivityMutation = useUserActivityMutation();

  // Prepare auth credentials with guards
  const digitPinCode = pinHash ? getDigitPinCode(pinHash) : '';
  const isHiveSigner =
    currentAccount?.local?.authType === authType.STEEM_CONNECT ||
    currentAccount?.local?.authType === authType.HIVE_AUTH;

  const accessToken =
    isHiveSigner && currentAccount?.local?.accessToken && digitPinCode
      ? decryptKey(currentAccount.local.accessToken, digitPinCode)
      : undefined;
  const postingKey =
    !isHiveSigner && currentAccount?.local?.postingKey && digitPinCode
      ? decryptKey(currentAccount.local.postingKey, digitPinCode)
      : undefined;

  const auth = {
    accessToken,
    postingKey,
    loginType: mapAuthTypeToLoginType(currentAccount.local.authType),
  };

  const broadcastMutation = useBroadcastMutation<{
    post: any;
    communityId: string;
    message: string;
  }>(
    [QUERIES.POST.CROSS_POST],
    currentAccount?.name || '',
    ({ post, communityId, message }) => {
      const { title } = post;
      const author = currentAccount?.name || currentAccount?.username || '';
      const permlink = `${post.permlink}-${communityId}`;
      const body = makeCrossPostMessage(post, author, message);

      const metadata = {
        original_author: post.author,
        original_permlink: post.permlink,
      };

      const jsonMetadata = makeJsonMetadata(metadata, ['cross-post']);
      const options = makeOptions({ author, permlink, operationType: 'dp' });
      options.allow_curation_rewards = false;

      return [
        [
          'comment',
          {
            parent_author: '',
            parent_permlink: communityId,
            author,
            permlink,
            title,
            body,
            json_metadata: jsonMetadata,
          },
        ],
        ['comment_options', options],
      ];
    },
    () => {}, // onSuccess callback
    auth,
  );

  return useMutation({
    mutationKey: [QUERIES.POST.CROSS_POST],
    mutationFn: async ({
      post,
      communityId,
      message,
    }: {
      post: any;
      communityId: string;
      message: string;
    }) => {
      if (!communityId || !currentAccount) {
        throw new Error('Not enough data to make cross post');
      }

      // Validate decrypted credentials
      if (isHiveSigner && !accessToken) {
        throw new Error('Failed to decrypt access token. Please check your PIN.');
      }
      if (!isHiveSigner && !postingKey) {
        throw new Error('Failed to decrypt posting key. Please check your PIN.');
      }

      const resp = await broadcastMutation.mutateAsync({
        post,
        communityId,
        message,
      });

      // track user activity points ty=130
      userActivityMutation.mutate({
        pointsTy: PointActivityIds.REBLOG,
        transactionId: (resp as any)?.id,
      });

      return resp;
    },
    retry: 3,

    onSuccess: (resp) => {
      console.log('cross post response', resp);
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.success',
          }),
        ),
      );
    },
    onError: (error) => {
      if (error?.jse_shortmsg?.split(': ')[1]?.includes('wait to transact')) {
        // when RC is not enough, offer boosting account
        dispatch(setRcOffer(true));
      } else {
        // when other errors
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      }
    },
  });
}

export const makeCrossPostMessage = (post: any, poster: string, message: string) => {
  const { author, permlink, category } = post;
  const postLink = `[@${author}/${permlink}](/${category}/@${author}/${permlink})`;
  return `This is a cross post of ${postLink} by @${poster}.<br><br>${message}`;
};
