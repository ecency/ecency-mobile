import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { unionBy, isArray } from 'lodash';
import BackgroundTimer from 'react-native-background-timer';
import { AppState, NativeEventSubscription } from 'react-native';
import QUERIES from '../queryKeys';
import { useAppSelector } from '../../../hooks';
import { getAccountPosts, getRankedPosts } from '../../hive/dhive';
import { getPromotedEntries } from '../../ecency/ecency';
import filterNsfwPost from '../../../utils/filterNsfwPost';
import { useGetPostQuery } from './postQueries';

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
  cachePage,
  enableFetchOnAppState,
  pinnedPermlink,
}: FeedQueryParams) => {
  const postFetchTimerRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef<NativeEventSubscription | null>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageKeys, setPageKeys] = useState(['']);
  const [latestPosts, setLatestPosts] = useState([]);

  const cache = useAppSelector((state) => state.cache);
  const cacheRef = useRef(cache);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const nsfw = useAppSelector((state) => state.application.nsfw);
  const { mutes } = currentAccount;

  const pinnedPostQuery = useGetPostQuery({
    author: feedUsername,
    permlink: pinnedPermlink,
    isPinned: true,
  });

  const queryClient = useQueryClient();

  // side effects
  useEffect(() => {
    if (enableFetchOnAppState) {
      appStateSubRef.current = AppState.addEventListener('change', _handleAppStateChange);
    }
    return _cleanup;
  }, []);

  // hook to update cache reference,
  // workaround required since query fucntion do get passed an
  // updated copy for states that are not part of query key and contexet while conext is not
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
      feedQueries[0].data &&
      feedQueries[0].data.length > 0
    ) {
      _fetchLatestPosts();
    }

    appState.current = nextAppState;
  };

  const _fetchPosts = async (pageKey: string) => {
    // console.log('fetching waves from:', host, pagePermlink);
    const [startAuthor, startPermlink] = _parsePostLocalKey(pageKey);

    let func = getAccountPosts;
    const options: any = {
      observer: feedUsername || '',
      start_author: startAuthor,
      start_permlink: startPermlink,
      limit: POSTS_FETCH_COUNT,
    };

    switch (filterKey) {
      case 'friends':
        func = getAccountPosts;
        options.sort = 'feed';
        options.account = feedUsername;
        break;
      case 'communities':
        func = getRankedPosts;
        options.sort = 'created';
        options.tag = 'my';
        break;
      case 'posts':
      case 'blog':
      case 'reblog':
        func = getAccountPosts;
        options.account = feedUsername;
        options.sort = filterKey;
        break;
      default:
        func = getRankedPosts;
        options.sort = filterKey;
        options.tag = tag;
        break;
    }

    // fetching posts
    const response: any[] = await func(options, feedUsername, nsfw);

    if (!Array.isArray(response) || response.length == 0) {
      return [];
    }

    if (!pageKey) {
      _scheduleLatestPostsCheck(response[0]);
    }

    return response;
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastPost = !!lastPage?.length && lastPage[lastPage.length - 1];

    console.log('extracting next page parameter', lastPost.url);
    return _getPostLocalKey(lastPost?.author, lastPost?.permlink);
  };

  const _getFeedQueryKey = (pageKey: string) => [
    QUERIES.FEED.GET,
    feedUsername || tag,
    filterKey,
    pageKey,
    cachePage,
  ];

  // query initialization
  const feedQueries = useQueries({
    queries: pageKeys.map((pageKey) => ({
      queryKey: _getFeedQueryKey(pageKey),
      queryFn: () => _fetchPosts(pageKey),
      initialData: [],
    })),
  });

  const _lastPage = feedQueries[feedQueries.length - 1];

  const _refresh = async () => {
    setIsRefreshing(true);
    setPageKeys(['']);

    pinnedPostQuery.refetch();
    await feedQueries[0].refetch();

    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    if (!_lastPage || _lastPage.isFetching || !isArray(_lastPage.data)) {
      return;
    }

    const _pageKey = _getNextPageParam(_lastPage.data);
    if (_pageKey && !pageKeys.includes(_pageKey)) {
      pageKeys.push(_pageKey);
      setPageKeys([...pageKeys]);
    }
  };

  // schedules post fetch
  const _scheduleLatestPostsCheck = (firstPost?: any) => {
    if (!firstPost && Array.isArray(feedQueries[0].data)) {
      [firstPost] = feedQueries[0].data;
    }

    if (firstPost) {
      if (postFetchTimerRef.current) {
        BackgroundTimer.clearTimeout(postFetchTimerRef.current);
        postFetchTimerRef.current = null;
      }

      const timeLeft = calculateTimeLeftForPostCheck(firstPost);
      postFetchTimerRef.current = BackgroundTimer.setTimeout(() => {
        _fetchLatestPosts();
      }, timeLeft);
    }
  };

  // fetch and filter posts that are not present in top 5 posts currently in list.
  const _fetchLatestPosts = async () => {
    const _fetchedPosts = await _fetchPosts('');
    const _cachedPosts: any[] = queryClient.getQueryData(_getFeedQueryKey('')) || [];

    const _latestPosts = [] as any;

    _fetchedPosts.forEach((post) => {
      const newPostAuthPrem = post.author + post.permlink;
      const postExist = _cachedPosts.find(
        (cPost) => cPost.author + cPost.permlink === newPostAuthPrem,
      );

      if (!postExist) {
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
    const _prevData = feedQueries[0].data || [];
    const _firstPageKey = _getFeedQueryKey('');
    queryClient.setQueryData(_firstPageKey, [...latestPosts, ..._prevData]);
    _scheduleLatestPostsCheck(latestPosts[0]);
    setLatestPosts([]);
  };

  const _resetLatestPosts = () => {
    setLatestPosts([]);
  };

  const _data = unionBy(
    pinnedPostQuery.data ? [pinnedPostQuery.data] : [],
    ...feedQueries.map((query) => query.data),
    'url',
  );
  const _filteredData = useMemo(
    () => _data.filter((post) => (isArray(mutes) ? mutes.indexOf(post?.author) < 0 : true)),
    [mutes, _data],
  );

  return {
    data: _filteredData,
    isRefreshing,
    isLoading: _lastPage.isLoading || _lastPage.isFetching,
    latestPosts,
    fetchNextPage: _fetchNextPage,
    mergetLatestPosts: _mergeLatestPosts,
    resetLatestPosts: _resetLatestPosts,
    refresh: _refresh,
  };
};

/** hook used to return user drafts */
export const usePromotedPostsQuery = () => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const nsfw = useAppSelector((state) => state.application.nsfw);

  const _getPromotedPosts = async () => {
    try {
      const posts = await getPromotedEntries(currentAccount.username);

      return Array.isArray(posts) ? filterNsfwPost(posts, nsfw) : [];
    } catch (err) {
      console.warn('Failed to get promoted posts, ', err);
      return [];
    }
  };

  return useQuery({
    queryKey: [QUERIES.FEED.GET_PROMOTED, currentAccount.username],
    queryFn: _getPromotedPosts,
    initialData: [],
  });
};

// cacludate posts check refresh time for selected filter;
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

const _getPostLocalKey = (author: string, permlink: string) =>
  author && permlink ? `${author}/${permlink}` : undefined;
const _parsePostLocalKey = (localKey: string) => (localKey ? localKey.split('/') : ['', '']);
