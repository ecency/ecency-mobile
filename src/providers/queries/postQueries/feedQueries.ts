import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import QUERIES from "../queryKeys";
import { unionBy, isArray } from 'lodash';
import { useAppSelector } from "../../../hooks";
// import { injectPostCache } from "../../../utils/postParser";
import { getAccountPosts, getRankedPosts } from "../../hive/dhive";

const POSTS_PER_PAGE = 5;

interface FeedQueryParams {
  feedUsername?: string,
  filterKey?: string,
  tag?: string,
  cachePage?: boolean,
}

export const useFeedQuery = ({ feedUsername, filterKey, tag, cachePage }: FeedQueryParams) => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageKeys, setPageKeys] = useState(['']);


  const cache = useAppSelector((state) => state.cache);
  const cacheRef = useRef(cache);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const nsfw = useAppSelector((state) => state.application.nsfw);
  const { username, mutes } = currentAccount;

  // hook to update cache reference,
  // workaround required since query fucntion do get passed an
  // updated copy for states that are not part of query key and contexet while conext is not
  // supported by useQueries
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);


  const _fetchPosts = async (pageKey: string) => {
    // console.log('fetching waves from:', host, pagePermlink);
    const [startAuthor, startPermlink] = _parsePostLocalKey(pageKey);

    var func = getAccountPosts;
    var options: any = {
      observer: feedUsername || '',
      start_author: startAuthor,
      start_permlink: startPermlink,
      limit: POSTS_PER_PAGE,
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

    return result;
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastPost = lastPage && lastPage.length ? lastPage.slice(-1)[0] : undefined;
    console.log('extracting next page parameter', lastPost.url);
    return _getPostLocalKey(lastPost.author, lastPost.permlink);
  };

  // query initialization
  const feedQueries = useQueries({
    queries: pageKeys.map((pageKey) => ({
      queryKey: [QUERIES.FEED.GET, feedUsername || tag, filterKey, pageKey, cachePage ],
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


  const _data = unionBy(...feedQueries.map((query) => query.data), 'url');
  const _filteredData = useMemo(
    () => _data.filter((post) => (isArray(mutes) ? mutes.indexOf(post?.author) < 0 : true)),
    [mutes, _data],
  );

  return {
    data: _filteredData,
    isRefreshing,
    isLoading: _lastPage.isLoading || _lastPage.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};


const _getPostLocalKey = (author: string, permlink: string) => `${author}/${permlink}`;
const _parsePostLocalKey = (localKey: string) => localKey ? localKey.split('/') : ['', ''];