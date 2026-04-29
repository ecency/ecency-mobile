import {
  InfiniteData,
  QueryKey,
  UseMutationOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { isArray } from 'lodash';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  getAccountPosts,
  getWavesByHostQueryOptions,
  getWavesFollowingQueryOptions,
  getWavesByTagQueryOptions,
  getWavesByAccountQueryOptions,
  useDeleteComment,
  WaveEntry,
} from '@ecency/sdk';

import { parsePost } from '../../../utils/postParser';
import { useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useBotAuthorsQuery } from './postQueries';
import { selectCurrentAccount, selectCurrentAccountMutes } from '../../../redux/selectors';
import { useAuthContext } from '../../sdk';

type WavesQueryOptions =
  | ReturnType<typeof getWavesByHostQueryOptions>
  | ReturnType<typeof getWavesFollowingQueryOptions>
  | ReturnType<typeof getWavesByTagQueryOptions>
  | ReturnType<typeof getWavesByAccountQueryOptions>;

export const useWavesQuery = (sdkQueryOptions: WavesQueryOptions, host: string) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const intl = useIntl();

  const mutes = useAppSelector(selectCurrentAccountMutes);
  const currentAccount = useAppSelector(selectCurrentAccount);

  const botAuthorsQuery = useBotAuthorsQuery();
  const authContext = useAuthContext();
  const sdkDeleteMutation = useDeleteComment(currentAccount?.name, authContext, 'async');

  const [isRefreshing, setIsRefreshing] = useState(false);

  // All SDK wave query options share the same runtime shape but
  // differ in page-param generics; cast to satisfy useInfiniteQuery
  const wavesQuery = useInfiniteQuery({
    ...(sdkQueryOptions as ReturnType<typeof getWavesByHostQueryOptions>),
    refetchInterval: 60000,
  });

  const data = useMemo(() => {
    const flatData: WaveEntry[] = wavesQuery.data?.pages?.flat() ?? [];
    const botAuthors = botAuthorsQuery.data ?? [];

    return flatData
      .map((item) => parsePost(item, currentAccount?.name))
      .filter((post) => {
        if (!post) {
          return false;
        }
        // discard wave if author is muted
        if (isArray(mutes) && mutes.indexOf(post.author) >= 0) {
          return false;
        }
        // discard if wave is downvoted or marked gray
        if (post.isMuted) {
          return false;
        }
        // discard bot authors
        if (botAuthors.includes(post.author)) {
          return false;
        }
        return true;
      });
  }, [wavesQuery.data, mutes, botAuthorsQuery.data, currentAccount?.name]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await wavesQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const deleteWave = async ({
    _permlink,
    _parent_permlink,
  }: {
    _permlink: string;
    _parent_permlink: string;
  }) => {
    if (!currentAccount?.name) {
      return;
    }

    try {
      await sdkDeleteMutation.mutateAsync({
        author: currentAccount.name,
        permlink: _permlink,
        parentAuthor: host,
        parentPermlink: _parent_permlink,
      });

      // Remove deleted wave from cache
      queryClient.setQueryData<InfiniteData<WaveEntry[]>>(sdkQueryOptions.queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => page.filter((w) => w.permlink !== _permlink)),
        };
      });

      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    } catch (error) {
      console.error('Failed to delete wave:', error);
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.error' })));
    }
  };

  return {
    data,
    isRefreshing,
    isLoading: wavesQuery.isLoading,
    isFetchingNextPage: wavesQuery.isFetchingNextPage,
    hasNextPage: wavesQuery.hasNextPage,
    fetchNextPage: wavesQuery.fetchNextPage,
    refresh,
    deleteWave,
  };
};

interface PublishWaveContext {
  previousData: InfiniteData<WaveEntry[]> | undefined;
  queryKey: QueryKey;
}

export const usePublishWaveMutation = () => {
  const queryClient = useQueryClient();

  const _mutationFn = async (cachePostData: any) => {
    if (cachePostData) {
      const _host = cachePostData.parent_author;
      return _host;
    }
    throw new Error('invalid mutations data');
  };

  const _options: UseMutationOptions<string, unknown, any, PublishWaveContext> = {
    onMutate: async (cacheCommentData: any) => {
      const _host = cacheCommentData.parent_author;
      const sdkOptions = getWavesByHostQueryOptions(_host);

      await queryClient.cancelQueries({ queryKey: sdkOptions.queryKey });

      const previousData = queryClient.getQueryData<InfiniteData<WaveEntry[]>>(sdkOptions.queryKey);

      queryClient.setQueryData<InfiniteData<WaveEntry[]>>(sdkOptions.queryKey, (oldData) => {
        if (!oldData) {
          return { pages: [[cacheCommentData as WaveEntry]], pageParams: [undefined] };
        }
        const firstPage = oldData.pages[0] ?? [];
        return {
          ...oldData,
          pages: [[cacheCommentData as WaveEntry, ...firstPage], ...oldData.pages.slice(1)],
        };
      });

      return { previousData, queryKey: sdkOptions.queryKey };
    },

    onError: (_error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    onSuccess: async (host) => {
      const sdkOptions = getWavesByHostQueryOptions(host);
      queryClient.invalidateQueries({ queryKey: sdkOptions.queryKey });
    },
  };

  return useMutation({ mutationFn: _mutationFn, ..._options });
};

export const fetchLatestWavesContainer = async (host: string) => {
  const result = (await getAccountPosts('posts', host, '', '', 1, undefined)) || [];

  const _latestPost = result[0];

  if (!_latestPost) {
    throw new Error('Latest waves container could not be fetched');
  }

  return _latestPost;
};
