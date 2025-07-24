import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { get } from 'lodash';
import QUERIES from '../queryKeys';
import { useAppSelector } from '../../../hooks';
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';
import { getPostReblogs, postContent, reblog } from '../../hive/dhive';
import { PointActivityIds } from '../../ecency/ecency.types';
import { useUserActivityMutation } from '../pointQueries';
import { makeJsonMetadata, makeOptions } from '../../../utils/editor';

/** hook used to return post poll */
export const useGetReblogsQuery = (author: string, permlink: string) => {
  const query = useQuery<string[]>({
    queryKey: [QUERIES.POST.GET_REBLOGS, author, permlink],
    queryFn: async () => {
      if (!author || !permlink) {
        return null;
      }

      try {
        const reblogs = await getPostReblogs(author, permlink);
        if (!reblogs) {
          new Error('Reblog data unavailable');
        }

        return reblogs;
      } catch (err) {
        console.warn('Failed to get post', err);
        return [];
      }
    },
    initialData: [],
    gcTime: 30 * 60 * 1000, // keeps cache for 30 minutes
  });

  return query;
};

export function useReblogMutation(author: string, permlink: string) {
  // const { activeUser } = useMappedStore();
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const userActivityMutation = useUserActivityMutation();

  return useMutation({
    mutationKey: [QUERIES.POST.REBLOG_POST],
    mutationFn: async ({ undo }: { undo: boolean }) => {
      if (!author || !permlink || !currentAccount) {
        throw new Error('Not enough data to reblog post');
      }

      const resp = await reblog(currentAccount, pinHash, author, permlink, undo);

      // track user activity points ty=130
      userActivityMutation.mutate({
        pointsTy: PointActivityIds.REBLOG,
        transactionId: resp.id,
      });

      return resp;
    },
    retry: 3,

    onSuccess: (resp, vars) => {
      console.log('reblog response', resp);
      // update poll cache here
      queryClient.setQueryData<ReturnType<typeof useGetReblogsQuery>['data']>(
        [QUERIES.POST.GET_REBLOGS, author, permlink],
        (data) => {
          if (!data || !resp) {
            return data;
          }

          const _curIndex = data.indexOf(currentAccount.username);
          if (vars.undo) {
            data.splice(_curIndex, 1);
          } else if (_curIndex < 0) {
            data.splice(0, 0, currentAccount.username);
          }

          return [...data] as ReturnType<typeof useGetReblogsQuery>['data'];
        },
      );
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
        if (error && error.jse_shortmsg.split(': ')[1].includes('wait to transact')) {
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
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const userActivityMutation = useUserActivityMutation();

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

      const { title } = post;
      const author = currentAccount.username;
      const permlink = `${post.permlink}-${communityId}`;

      const body = makeCrossPostMessage(post, author, message);

      const metadata = {
        original_author: post.author,
        original_permlink: post.permlink,
      };

      const jsonMetadata = makeJsonMetadata(metadata, ['cross-post']);

      const options = makeOptions({ author, permlink, operationType: 'dp' });
      options.allow_curation_rewards = false;

      const resp = await postContent(
        currentAccount,
        pinHash,
        '',
        communityId,
        permlink,
        title,
        body,
        jsonMetadata,
        options,
      );

      // track user activity points ty=130
      userActivityMutation.mutate({
        pointsTy: PointActivityIds.REBLOG,
        transactionId: resp.id,
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
      if (error?.jse_shortmsg?.split(': ')[1].includes('wait to transact')) {
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
  return `This is a cross post of [@${post.author}/${post.permlink}](/${post.category}/@${post.author}/${post.permlink}) by @${poster}.<br><br>${message}`;
};
