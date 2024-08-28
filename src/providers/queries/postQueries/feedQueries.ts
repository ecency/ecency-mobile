import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import QUERIES from "../queryKeys";
import { unionBy, isArray } from 'lodash';
import { useAppSelector } from "../../../hooks";
// import { injectPostCache } from "../../../utils/postParser";
import BackgroundTimer from 'react-native-background-timer';
import { getAccountPosts, getRankedPosts } from "../../hive/dhive";
import { calculateTimeLeftForPostCheck } from "../../../components/tabbedPosts/services/tabbedPostsHelpers";
import { AppState, NativeEventSubscription } from "react-native";
import { getPromotedEntries } from "../../../providers/ecency/ecency";
import filterNsfwPost from "../../../utils/filterNsfwPost";

const POSTS_FETCH_COUNT = 10;

interface FeedQueryParams {
  feedUsername?: string,
  filterKey?: string,
  tag?: string,
  cachePage?: boolean,
  enableFetchOnAppState?: boolean
}

export const useFeedQuery = ({ feedUsername, filterKey, tag, cachePage, enableFetchOnAppState }: FeedQueryParams) => {
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
  const { username, mutes } = currentAccount;

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

    var func = getAccountPosts;
    var options: any = {
      observer: feedUsername || '',
      start_author: startAuthor,
      start_permlink: startPermlink,
      limit: POSTS_FETCH_COUNT,
    }

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
    const result: any[] = await func(options, feedUsername, nsfw);

    //TODO: inject cache here...
    //   const _cachedComments = cacheRef.current.commentsCollection;
    // const _cachedVotes = cacheRef.current.votesCollection;
    // const _lastCacheUpdate = cacheRef.current.lastCacheUpdate;
    // const _cResponse = injectPostCache(response, _cachedComments, _cachedVotes, _lastCacheUpdate);

    // const _threadedComments = await mapDiscussionToThreads(_cResponse, host, pagePermlink, 1);

    // if (!_threadedComments) {
    //   throw new Error('Failed to parse waves');
    // }

    // _threadedComments.sort((a, b) => (new Date(a.created) > new Date(b.created) ? -1 : 1));
    // _threadedComments.forEach((item) => {
    //   wavesIndexCollection.current[`${item.author}/${item.permlink}`] = pagePermlink;
    // });

    // console.log('new waves fetched', _threadedComments);

    if (!pageKey) {
      _scheduleLatestPostsCheck(result[0]);
    }

    return result;
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastPost = lastPage && lastPage.length ? lastPage.slice(-1)[0] : undefined;
    console.log('extracting next page parameter', lastPost.url);
    return _getPostLocalKey(lastPost.author, lastPost.permlink);
  };


  const _getFeedQueryKey = (pageKey: string) => [QUERIES.FEED.GET, feedUsername || tag, filterKey, pageKey, cachePage]

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

    await feedQueries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {

    if (!_lastPage || _lastPage.isFetching || !isArray(_lastPage.data)) {
      return;
    }

    const _pageKey = _getNextPageParam(_lastPage.data);
    if (!pageKeys.includes(_pageKey)) {
      pageKeys.push(_pageKey);
      setPageKeys([...pageKeys]);
    }
  };


  // schedules post fetch
  const _scheduleLatestPostsCheck = (firstPost?: any) => {
    if (!firstPost && feedQueries[0].data) {
      firstPost = feedQueries[0].data[0];
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
    const _cachedPosts:any[] = queryClient.getQueryData(_getFeedQueryKey('')) || []

    const _latestPosts = [] as any;

    _fetchedPosts.forEach((post) => {
      const newPostAuthPrem = post.author + post.permlink;
      const postExist = _cachedPosts.find((cPost) => cPost.author + cPost.permlink === newPostAuthPrem);

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
  }


  const _mergeLatestPosts = () => {
    const _prevData = feedQueries[0].data || [];
    const _firstPageKey = _getFeedQueryKey('');
    queryClient.setQueryData(_firstPageKey, [...latestPosts, ..._prevData]);
    _scheduleLatestPostsCheck(latestPosts[0]);
    setLatestPosts([]);
  }


  const _resetLatestPosts = () => {
    setLatestPosts([])
  }


  const _data = unionBy(...feedQueries.map((query) => query.data), 'url');
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
      return []
    }
  }

  return useQuery(
      [QUERIES.FEED.GET_PROMOTED, currentAccount.username], 
      _getPromotedPosts,
      {
        initialData:[]
      });
};



const _getPostLocalKey = (author: string, permlink: string) => `${author}/${permlink}`;
const _parsePostLocalKey = (localKey: string) => localKey ? localKey.split('/') : ['', ''];