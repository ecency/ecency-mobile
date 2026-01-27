import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { unionBy, isArray } from 'lodash';
import BackgroundTimer from 'react-native-background-timer';
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
  const postFetchTimerRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef<NativeEventSubscription | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latestPosts, setLatestPosts] = useState([]);

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
  const queryOptions = isAccountBasedFeed
    ? getAccountPostsInfiniteQueryOptions(
        sdkAccount || '',
        sdkSort,
        POSTS_FETCH_COUNT,
        currentAccount?.name || '',
        Boolean(sdkAccount), // only enable when account is present
      )
    : getPostsRankedInfiniteQueryOptions(
        sdkSort,
        sdkTag || '',
        POSTS_FETCH_COUNT,
        currentAccount?.name || '',
        true, // enabled
      );

  // Use SDK query options directly (no override) for consistency with vision-next
  const feedQuery = useInfiniteQuery({
    ...queryOptions,
    select: (data) => {
      // Apply NSFW filtering and parsePost to each page
      if (!data?.pages) return data;

      const currentTime = new Date().getTime();
      const filteredPages = data.pages.map((page) => {
        if (!Array.isArray(page)) return page;

        // Apply NSFW filter
        const nsfwFiltered = nsfw !== '0' ? filterNsfwPost(page, nsfw) : page;

        // Apply parsePost to add thumbnail, image, and summary fields
        return nsfwFiltered.map((post) =>
          parsePost(post, currentAccount?.name, false, true, false, currentTime),
        );
      });

      return {
        ...data,
        pages: filteredPages,
      };
    },
  });

  // side effects
  useEffect(() => {
    if (enableFetchOnAppState) {
      appStateSubRef.current = AppState.addEventListener('change', _handleAppStateChange);
    }
    return _cleanup;
  }, []);

  // hook to update cache reference,
  // workaround required since query function do get passed an
  // updated copy for states that are not part of query key and context while context is not
  // supported by useQueries
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const _cleanup = () => {
    if (postFetchTimerRef.current) {
      BackgroundTimer.clearTimeout(postFetchTimerRef.current);
      postFetchTimerRef.current = null;
    }
    if (enableFetchOnAppState && appStateSubRef.current) {
      appStateSubRef.current.remove();
    }
  };

  // actions
  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      feedQuery.data?.pages?.[0] &&
      feedQuery.data.pages[0].length > 0
    ) {
      _fetchLatestPosts();
    }

    appState.current = nextAppState;
  };

  // schedules post fetch
  const _scheduleLatestPostsCheck = (firstPost?: any) => {
    let postToCheck = firstPost;
    if (!postToCheck && Array.isArray(feedQuery.data?.pages?.[0])) {
      // eslint-disable-next-line prefer-destructuring
      [postToCheck] = feedQuery.data.pages[0];
    }

    if (postToCheck) {
      if (postFetchTimerRef.current) {
        BackgroundTimer.clearTimeout(postFetchTimerRef.current);
        postFetchTimerRef.current = null;
      }

      const timeLeft = calculateTimeLeftForPostCheck(postToCheck);
      postFetchTimerRef.current = BackgroundTimer.setTimeout(() => {
        _fetchLatestPosts();
      }, timeLeft);
    }
  };

  // fetch and filter posts that are not present in currently loaded posts
  const _fetchLatestPosts = async () => {
    // Capture ALL current posts BEFORE refetch to detect new ones
    // Check all pages, not just the first one, to avoid showing duplicates
    const _cachedPosts: any[] = feedQuery.data?.pages ? feedQuery.data.pages.flat() : [];

    let refetchResult;
    try {
      refetchResult = await feedQuery.refetch({ cancelRefetch: false });
    } catch (error) {
      console.warn('Error fetching latest posts:', error);
      _scheduleLatestPostsCheck();
      return;
    }

    // After refetch, the first page contains latest data
    const _fetchedPosts: any[] = refetchResult.data?.pages?.[0] || [];

    // Create Set of cached post keys for O(1) lookup across ALL pages
    const cachedKeys = new Set(_cachedPosts.map((post) => `${post.author}/${post.permlink}`));

    const _latestPosts = [] as any;

    _fetchedPosts.forEach((post) => {
      const postKey = `${post.author}/${post.permlink}`;
      if (!cachedKeys.has(postKey)) {
        _latestPosts.push(post);
      }
    });

    if (_latestPosts.length > 0) {
      setLatestPosts(_latestPosts.slice(0, 5));
    } else {
      _scheduleLatestPostsCheck();
      setLatestPosts([]);
    }
  };

  const _mergeLatestPosts = () => {
    const _prevData = feedQuery.data?.pages?.[0] || [];
    const updatedPages = [
      [...latestPosts, ..._prevData],
      ...(feedQuery.data?.pages?.slice(1) || []),
    ];

    queryClient.setQueryData(queryOptions.queryKey, {
      ...feedQuery.data,
      pages: updatedPages,
    });

    _scheduleLatestPostsCheck(latestPosts[0]);
    setLatestPosts([]);
  };

  const _resetLatestPosts = () => {
    setLatestPosts([]);
  };

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
    latestPosts,
    fetchNextPage: feedQuery.fetchNextPage,
    mergetLatestPosts: _mergeLatestPosts,
    resetLatestPosts: _resetLatestPosts,
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
    // Apply NSFW filtering and parsePost to results
    select: (data) => {
      if (!Array.isArray(data)) return [];

      // Apply NSFW filter
      const nsfwFiltered = nsfw !== '0' ? filterNsfwPost(data, nsfw) : data;

      // Apply parsePost to add thumbnail, image, and summary fields
      const currentTime = new Date().getTime();
      return nsfwFiltered.map((post) =>
        parsePost(post, currentAccount?.name, true, true, false, currentTime),
      );
    },
    // Handle errors gracefully
    meta: {
      errorMessage: 'Failed to get promoted posts',
    },
  });
};

// calculate posts check refresh time for selected filter;
export const calculateTimeLeftForPostCheck = (firstPost: any) => {
  const refetchTime = 600000;

  // schedules refresh 30 minutes after last post creation time
  const currentTime = new Date().getTime();
  const createdAt = new Date(firstPost.created).getTime();

  const timeSpent = currentTime - createdAt;
  let timeLeft = refetchTime - timeSpent;
  if (timeLeft < 30000) {
    timeLeft = refetchTime;
  }
  return timeLeft;
};
