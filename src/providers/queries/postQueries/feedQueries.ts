import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unionBy, isArray } from 'lodash';
import { AppState, NativeEventSubscription } from 'react-native';
import {
  getPostsRankedInfiniteQueryOptions,
  getAccountPostsInfiniteQueryOptions,
  getPromotedPostsQuery,
  useDeleteComment,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import QUERIES from '../queryKeys';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useAuthContext } from '../../sdk';
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

/**
 * `author/permlink` of posts deleted during this app session.
 *
 * Module level rather than component state on purpose. The delete broadcasts
 * async, so hivemind has not indexed it yet and any query refetching in that
 * window returns the post again. Component state is lost when the screen
 * unmounts, so leaving a profile and returning was enough to bring a deleted
 * post back. Keeping it here suppresses the row whatever any cache holds,
 * without forcing a fetch that would lose the race anyway.
 */
const deletedPostKeys = new Set<string>();

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
  // Bumped when a delete lands, to re-run the memo below against the module set
  // above. It is applied to the assembled list rather than only the feed cache,
  // because the list is assembled from more than that cache and the cache holds
  // *raw* posts:
  //  - the pinned post comes from its own query and is prepended
  //  - `select` parses a shallow copy, so a cross-post's cached author/permlink
  //    are the wrapper's while the rendered ones are the original's
  // Matching on the displayed identity is what the user actually acted on.
  const [deletedVersion, setDeletedVersion] = useState(0);

  const cache = useAppSelector((state) => state.cache);
  const cacheRef = useRef(cache);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const nsfw = useAppSelector(selectNsfw);
  const mutes = currentAccount?.mutes || [];

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const authContext = useAuthContext();
  const sdkDeleteMutation = useDeleteComment(currentAccount?.name, authContext, 'async');

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
        sdkSort as any,
        sdkTag || '',
        POSTS_FETCH_COUNT,
        observer,
        true, // enabled
      );

  // Stable timestamp: only advances when query data changes (dataUpdatedAt).
  // Avoids new Date() inside select which would defeat TanStack structural sharing.
  const feedQuery = useInfiniteQuery({
    ...(queryOptions as any),
    // No client-side retry here. These reads go through hive-tx, which already
    // walks the node pool (config.retry, bounded by resilience.totalBudgetFactor)
    // before it rejects, so a React Query retry on top only doubles how long the
    // screen holds a skeleton before it is allowed to show the error.
    retry: false,
    select: useCallback(
      (data: any) => {
        if (!data?.pages) return data;

        const filteredPages = data.pages.map((page: any) => {
          if (!Array.isArray(page)) return page;

          const nsfwFiltered = nsfw !== '0' ? filterNsfwPost(page, nsfw) : page;

          // Shallow-copy before parsing: parsePost mutates its argument in place and
          // `nsfwFiltered` holds React Query cache objects — mutating them defeats
          // structural sharing and re-parses already-parsed data on every refetch.
          return nsfwFiltered.map((post) =>
            parsePost({ ...post }, currentAccount?.name, false, true, false),
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
    (nextAppState: any) => {
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
  const _data = useMemo(
    () => unionBy(pinnedPostQuery.data ? [pinnedPostQuery.data] : [], _flatData, 'url'),
    [pinnedPostQuery.data, _flatData],
  );

  // Apply mute filtering — Set for O(1) lookup instead of O(n) indexOf
  const mutesSet = useMemo(() => (isArray(mutes) ? new Set(mutes) : null), [mutes]);
  const _filteredData = useMemo(
    () =>
      _data.filter(
        (post) =>
          (mutesSet ? !mutesSet.has(post?.author) : true) &&
          !deletedPostKeys.has(`${post?.author}/${post?.permlink}`),
      ),

    [mutesSet, _data, deletedVersion],
  );

  /**
   * Deletes a post and prunes it from this feed's cache.
   *
   * The options sheet's own delete path calls `navigation.goBack()`, which on a
   * feed pops the screen the list is on, and it never touches the feed cache, so
   * the deleted post stays visible. Consumers pass this as `onDelete` so the
   * sheet delegates instead.
   *
   * The cache is patched rather than invalidated because the delete broadcasts
   * async: `mutateAsync` resolves on mempool acceptance, so a refetch issued
   * here would return pre-transaction state and bring the post straight back.
   */
  const deletePost = useCallback(
    async (content: any) => {
      if (!currentAccount?.name || !content?.permlink) {
        return;
      }

      await sdkDeleteMutation.mutateAsync({
        author: currentAccount.name,
        permlink: content.permlink,
        parentAuthor: content.parent_author || '',
        parentPermlink: content.parent_permlink || '',
      });

      // Match author as well as permlink: a permlink is only unique per author,
      // so filtering on it alone could drop someone else's post.
      queryClient.setQueryData<InfiniteData<any[]>>(queryOptions.queryKey, (oldData) => {
        if (!oldData?.pages) {
          return oldData;
        }
        return {
          ...oldData,
          // Guarded like `select` above: a page is not assumed to be an array,
          // and an unguarded filter here would throw and abort the whole cache
          // update rather than skipping one page.
          pages: oldData.pages.map((page) =>
            Array.isArray(page)
              ? page.filter(
                  (post) =>
                    !(post?.author === currentAccount.name && post?.permlink === content.permlink),
                )
              : page,
          ),
        };
      });

      // Deliberately does not clear the pinned post's own query. Emptying it
      // forces a refetch, and the delete broadcasts async, so that refetch
      // returns the not-yet-indexed post and puts it straight back. Recording
      // the key suppresses the row whatever any cache still holds, and covers
      // the cross-post case too, where the cached identity is the wrapper's
      // while the rendered one is the original's.
      deletedPostKeys.add(`${content.author}/${content.permlink}`);
      setDeletedVersion((v) => v + 1);

      dispatch(toastNotification(intl.formatMessage({ id: 'alert.removed' })));
    },
    [
      currentAccount?.name,
      // mutateAsync is stable across renders; the mutation result object is not.
      sdkDeleteMutation.mutateAsync,
      queryOptions.queryKey,
      queryClient,
      dispatch,
      intl,
    ],
  );

  return {
    data: _filteredData,
    isRefreshing,
    isLoading: feedQuery.isLoading,
    fetchNextPage: feedQuery.fetchNextPage,
    refresh: _refresh,
    deletePost,
    // Surfaced so the list can render a retry instead of a skeleton that never
    // resolves. Scoped to the first page: once posts are on screen a failed
    // "load more" must not replace them with an error state.
    isError: feedQuery.isError && _filteredData.length === 0,
    error: feedQuery.error,
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

      const nsfwFiltered = nsfw !== '0' ? filterNsfwPost(data as any, nsfw) : data;

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
