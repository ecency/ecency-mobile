import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unionBy, isArray } from 'lodash';
import { AppState, NativeEventSubscription } from 'react-native';
import {
  getPostsRankedInfiniteQueryOptions,
  getAccountPostsInfiniteQueryOptions,
  getPromotedPostsQuery,
} from '@ecency/sdk';
import QUERIES from '../queryKeys';
import { useAppSelector } from '../../../hooks';
import filterNsfwPost from '../../../utils/filterNsfwPost';
import { useGetPostQuery } from './postQueries';
import { selectNsfw, selectCurrentAccount } from '../../../redux/selectors';
import { parsePost } from '../../../utils/postParser';

const POSTS_FETCH_COUNT = 10;

interface FeedQueryParams {
  feedUsername?: string;
  filterKey?: string;
  tag?: string;
  cachePage?: boolean;
  enableFetchOnAppState?: boolean;
  pinnedPermlink?: string;
}

export const useFeedQuery = ({
  feedUsername,
  filterKey,
  tag,
  cachePage: _cachePage, // No longer used with SDK query keys
  enableFetchOnAppState,
  pinnedPermlink,
}: FeedQueryParams) => {
  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef<NativeEventSubscription | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const cache = useAppSelector((state) => state.cache);
  const cacheRef = useRef(cache);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const nsfw = useAppSelector(selectNsfw);
  const mutes = currentAccount?.mutes || [];

  const pinnedPostQuery = useGetPostQuery({
    author: feedUsername,
    permlink: pinnedPermlink,
    isPinned: true,
  });

  const queryClient = useQueryClient();

  // Determine which query options to use based on filterKey
  const isAccountBasedFeed =
    filterKey === 'friends' ||
    filterKey === 'posts' ||
    filterKey === 'blog' ||
    filterKey === 'reblog';
  const isCommunityFeed = filterKey === 'communities';

  // Map filterKey to SDK sort parameter
  let sdkSort = filterKey;
  let sdkTag = tag;
  const sdkAccount = feedUsername;

  if (filterKey === 'friends') {
    sdkSort = 'feed';
  } else if (isCommunityFeed) {
    sdkSort = 'created';
    sdkTag = 'my';
  }

  // Get appropriate query options from SDK
  // IMPORTANT: Pass undefined (not empty string) for observer when no account
  // Empty string causes API to not return user's votes in active_votes array
  const observer = currentAccount?.name || currentAccount?.username;

  const queryOptions = isAccountBasedFeed
    ? getAccountPostsInfiniteQueryOptions(
        sdkAccount || '',
        sdkSort,
        POSTS_FETCH_COUNT,
        observer,
        Boolean(sdkAccount), // only enable when account is present
      )
    : getPostsRankedInfiniteQueryOptions(
        sdkSort,
        sdkTag || '',
        POSTS_FETCH_COUNT,
        observer,
        true, // enabled
      );

  // Stable timestamp: only advances when query data changes (dataUpdatedAt).
  // Avoids new Date() inside select which would defeat TanStack structural sharing.
  const feedQuery = useInfiniteQuery({
    ...queryOptions,
    select: useCallback(
      (data) => {
        if (!data?.pages) return data;

        const filteredPages = data.pages.map((page) => {
          if (!Array.isArray(page)) return page;

          const nsfwFiltered = nsfw !== '0' ? filterNsfwPost(page, nsfw) : page;

          return nsfwFiltered.map((post) =>
            parsePost(post, currentAccount?.name, false, true, false),
          );
        });

        return {
          ...data,
          pages: filteredPages,
        };
      },
      [nsfw, currentAccount?.name],
    ),
  });

  // actions
  const _handleAppStateChange = useCallback(
    (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        feedQuery.data?.pages &&
        feedQuery.data.pages.length > 0
      ) {
        // Invalidate query to fetch fresh data when app comes to foreground
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
      }

      appState.current = nextAppState;
    },
    [feedQuery.data?.pages, queryOptions.queryKey, queryClient],
  );

  // side effects
  useEffect(() => {
    if (!enableFetchOnAppState) return;
    appStateSubRef.current = AppState.addEventListener('change', _handleAppStateChange);
    return () => appStateSubRef.current?.remove();
  }, [enableFetchOnAppState, _handleAppStateChange]);

  // hook to update cache reference,
  // workaround required since query function do get passed an
  // updated copy for states that are not part of query key and context while context is not
  // supported by useQueries
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const _refresh = async () => {
    setIsRefreshing(true);

    try {
      await pinnedPostQuery.refetch();
      await feedQuery.refetch();
    } catch (error) {
      console.warn('Error refreshing feed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Flatten pages data
  const _flatData = useMemo(() => {
    if (!feedQuery.data?.pages) return [];
    return feedQuery.data.pages.flat();
  }, [feedQuery.data?.pages]);

  // Combine pinned post with feed data
  const _data = unionBy(pinnedPostQuery.data ? [pinnedPostQuery.data] : [], _flatData, 'url');

  // Apply mute filtering
  const _filteredData = useMemo(
    () => _data.filter((post) => (isArray(mutes) ? mutes.indexOf(post?.author) < 0 : true)),
    [mutes, _data],
  );

  return {
    data: _filteredData,
    isRefreshing,
    isLoading: feedQuery.isLoading || feedQuery.isFetching,
    fetchNextPage: feedQuery.fetchNextPage,
    refresh: _refresh,
  };
};

/** hook used to return promoted posts with NSFW filtering */
export const usePromotedPostsQuery = (enabled: boolean = true) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const nsfw = useAppSelector(selectNsfw);

  // Use SDK query options
  const queryOptions = getPromotedPostsQuery('feed');

  return useQuery({
    ...queryOptions,
    enabled,
    // Override queryKey to include username for cache invalidation (use empty string if no account)
    queryKey: [QUERIES.FEED.GET_PROMOTED, currentAccount?.name || ''],
    select: (data) => {
      if (!Array.isArray(data)) return [];

      const nsfwFiltered = nsfw !== '0' ? filterNsfwPost(data, nsfw) : data;

      return nsfwFiltered.map((post) => parsePost(post, currentAccount?.name, true, true, false));
    },
    // Handle errors gracefully
    meta: {
      errorMessage: 'Failed to get promoted posts',
    },
  });
};

// calculate posts check refresh time for selected filter;
export const calculateTimeLeftForPostCheck = (firstPost: any) => {
  const refetchTime = 120000; // Check every 2 minutes for new content

  // Calculate time since post creation to potentially adjust frequency
  const currentTime = new Date().getTime();
  const createdAt = new Date(firstPost?.created).getTime();
  const timeSpent = currentTime - createdAt;

  // If post is very recent (< 5 minutes old), check more frequently
  if (timeSpent < 300000) {
    return 60000; // Check every 1 minute for fresh content
  }

  // Otherwise check every 2 minutes
  return refetchTime;
};
