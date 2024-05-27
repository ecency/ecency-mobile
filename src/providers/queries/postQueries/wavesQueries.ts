import { QueryKey, UseMutationOptions, useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { unionBy, isArray } from 'lodash';
import { getDiscussionCollection, getAccountPosts } from '../../hive/dhive';

import QUERIES from '../queryKeys';
import { delay } from '../../../utils/editor';
import {
  injectPostCache,
  injectVoteCache,
  mapDiscussionToThreads,
} from '../../../utils/postParser';
import { useAppSelector } from '../../../hooks';

export const useWavesQuery = (host: string) => {
  const queryClient = useQueryClient();

  const cache = useAppSelector((state) => state.cache);
  const mutes = useAppSelector((state) => state.account.currentAccount.mutes);
  const cacheRef = useRef(cache);

  const cachedVotes = cache.votesCollection;
  const lastCacheUpdate = cache.lastUpdate;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePermlinks, setActivePermlinks] = useState<string[]>([]);

  const wavesIndexCollection = useRef<{ [key: string]: string }>({});

  const _initialContainerPermlinks = useMemo(
    () => queryClient.getQueryData<string[]>([QUERIES.WAVES.INITIAL_CONTAINERS, host]) || [],
    [],
  );
  const [permlinksBucket, setPermlinksBucket] = useState<string[]>(_initialContainerPermlinks);

  // query initialization
  const wavesQueries = useQueries({
    queries: activePermlinks.map((pagePermlink, index) => ({
      queryKey: [QUERIES.WAVES.GET, host, pagePermlink, index], // index at end is used to track query hydration
      queryFn: () => _fetchWaves(pagePermlink),
      initialData: [],
    })),
  });

  const _lastItem = wavesQueries[wavesQueries.length - 1];

  // hook to update cache reference,
  // workaround required since query fucntion do get passed an
  // updated copy for states that are not part of query key and contexet while conext is not
  // supported by useQueries
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  useEffect(() => {
    _fetchPermlinks('', true);
  }, []);

  useEffect(() => {
    if (permlinksBucket.length) {
      // if first elements permlinks do not match, means there is a new container, push at first
      if (permlinksBucket[0] !== activePermlinks[0]) {
        activePermlinks.splice(0, 0, permlinksBucket[0]);
      }
      // permlinks bucket is updated, it needs to be connect with active one to start chain again
      else {
        activePermlinks.push(permlinksBucket[activePermlinks.length]);
      }
      setActivePermlinks([...activePermlinks]);
    }
  }, [permlinksBucket]);

  useEffect(() => {
    const _latestData = _lastItem?.data;
    if (!_latestData || _latestData.length < 10) {
      _fetchNextPage();
    }
  }, [_lastItem?.data]);

  useEffect(() => {
    // check cache is recently updated and take post path
    if (lastCacheUpdate) {
      const _timeElapsed = new Date().getTime() - lastCacheUpdate.updatedAt;
      if (lastCacheUpdate.type === 'vote' && _timeElapsed < 5000) {
        _injectPostCache(lastCacheUpdate.postPath);
      }
    }
  }, [lastCacheUpdate]);

  const _injectPostCache = async (postPath: string) => {
    // using post path get index of query key where that post exists
    const _containerPermlink = wavesIndexCollection.current[postPath];
    const _containerIndex = activePermlinks.indexOf(_containerPermlink);
    const _voteCache = cachedVotes[postPath];

    if (_containerIndex >= 0 && _voteCache) {
      // mean data exist, get query data, update query data by finding post and injecting cache
      const _qData: any[] | undefined = wavesQueries[_containerIndex].data;

      if (_qData) {
        const _postIndex = _qData.findIndex(
          (item) => lastCacheUpdate.postPath === `${item.author}/${item.permlink}`,
        );
        const _post = _qData[_postIndex];

        if (_post) {
          // inject cache and set query data
          const _cPost = injectVoteCache(_post, _voteCache);
          _qData.splice(_postIndex, 1, _cPost);
          queryClient.setQueryData(
            [QUERIES.WAVES.GET, host, _containerPermlink, _containerIndex],
            [..._qData],
          ); // TODO: use container permlink as well
        }
      }
    }
  };

  const _fetchPermlinks = async (startPermlink = '', refresh = false) => {
    setIsLoading(true);
    try {
      const query: any = {
        account: host,
        start_author: startPermlink ? host : '',
        start_permlink: startPermlink,
        limit: 5,
        observer: '',
        sort: 'posts',
      };

      const result = await getAccountPosts(query);

      const _fetchedPermlinks = result.map((post) => post.permlink);
      console.log('permlinks fetched', _fetchedPermlinks);

      const _permlinksBucket = refresh
        ? _fetchedPermlinks
        : [...permlinksBucket, ..._fetchedPermlinks];
      setPermlinksBucket(_permlinksBucket);

      if (refresh) {
        queryClient.setQueryData([QUERIES.WAVES.INITIAL_CONTAINERS, host], _permlinksBucket);
        // precautionary delay of 200ms to let state update before concluding promise,
        // it is effective for waves refresh routine.
        await delay(200);
      }
    } catch (err) {
      console.warn('failed to fetch waves permlinks');
    }

    setIsLoading(false);
  };

  const _fetchWaves = async (pagePermlink: string) => {
    console.log('fetching waves from:', host, pagePermlink);
    const response = await getDiscussionCollection(host, pagePermlink);

    // inject cache here...
    const _cachedComments = cacheRef.current.commentsCollection;
    const _cachedVotes = cacheRef.current.votesCollection;
    const _lastCacheUpdate = cacheRef.current.lastCacheUpdate;
    const _cResponse = injectPostCache(response, _cachedComments, _cachedVotes, _lastCacheUpdate);

    const _threadedComments = await mapDiscussionToThreads(_cResponse, host, pagePermlink, 1);

    if (!_threadedComments) {
      throw new Error('Failed to parse waves');
    }

    _threadedComments.filter((item) => item.net_rshares >= 0 && !item.stats?.gray && !item.stats.hide);
    _threadedComments.sort((a, b) => (new Date(a.created) > new Date(b.created) ? -1 : 1));
    _threadedComments.forEach((item) => {
      wavesIndexCollection.current[`${item.author}/${item.permlink}`] = pagePermlink;
    });

    console.log('new waves fetched', _threadedComments);

    return _threadedComments || [];
  };

  const _fetchNextPage = () => {

    if (!_lastItem || _lastItem.isFetching) {
      return;
    }

    const _nextPagePermlink = permlinksBucket[activePermlinks.length];


    if (_nextPagePermlink && !activePermlinks.includes(_nextPagePermlink)) {
      console.log('updating next page permlink', _nextPagePermlink);
      activePermlinks.push(_nextPagePermlink);
      setActivePermlinks([...activePermlinks]);
    } else {
      console.log('fetching new containers');
      _fetchPermlinks(permlinksBucket.slice(-1)[0]);
    }
  };

  const _refresh = async () => {
    setIsRefreshing(true);
    setPermlinksBucket([]);
    setActivePermlinks([]);
    await _fetchPermlinks('', true);
    await wavesQueries[0].refetch();
    setIsRefreshing(false);
  };

  const _data = unionBy(...wavesQueries.map((query) => query.data), 'url');

  const _filteredData = useMemo(
    
    () => _data.filter((post) => 
      {
        let _status = true;
        //discard wave if author is muted
        if (isArray(mutes) && mutes.indexOf(post?.author) > 0) {
          _status = false;
        } 
        
        //discard if wave is downvoted or marked gray
        else if (post.net_rshares < 0 || post.stats?.gray || post.stats.hide) {
          _status = false
        }
  
        return _status
      }),
      // (isArray(mutes) ? mutes.indexOf(post?.author) < 0 : true)),
    [mutes, _data],
  );

  const _lastestWavesFetch = async () => {
    await _fetchPermlinks('', true);
    const _prevLatestWave = _filteredData[0];
    const _firstQuery = wavesQueries[0];

    if (!_firstQuery) {
      return [];
    }

    const queryResponse = await _firstQuery.refetch();

    const _newData: any[] = queryResponse.data || [];

    // check if new waves are available
    const _lastIndex = _newData?.findIndex(
      (item) => item.author + item.permlink === _prevLatestWave.author + _prevLatestWave.permlink,
    );

    let _newWaves: any[] = [];
    if (_lastIndex && _lastIndex !== 0) {
      if (_lastIndex < 0) {
        _newWaves = _newData?.slice(0, 5) || [];
      } else {
        _newWaves = _newData?.slice(0, _lastIndex) || [];
      }
    }

    return _newWaves;
  };

  return {
    data: _filteredData,
    isRefreshing,
    isLoading: isLoading || _lastItem?.isLoading || _lastItem?.isFetching,
    fetchNextPage: _fetchNextPage,
    latestWavesFetch: _lastestWavesFetch,
    refresh: _refresh,
  };
};

export const usePublishWaveMutation = () => {
  const queryClient = useQueryClient();

  // id is options, if no id is provided program marks all notifications as read;
  const _mutationFn = async (cachePostData: any) => {
    // TODO: lates port wave publishing here or introduce post publishing mutation;
    if (cachePostData) {
      // TODO: expand to check multiple wave hosts;{
      const _host = cachePostData.parent_author;

      console.log('returning waves host', _host);
      return _host;
    }

    throw new Error('invalid mutations data');
  };

  const _options: UseMutationOptions<string, unknown, any, void> = {
    onMutate: async (cacheCommentData: any) => {
      // TODO: find a way to optimise mutations by avoiding too many loops
      console.log('on mutate data', cacheCommentData);

      const _host = cacheCommentData.parent_author;

      // update query data
      const containerQueriesData: [QueryKey, string[] | undefined][] = queryClient.getQueriesData([QUERIES.WAVES.INITIAL_CONTAINERS, _host]);

      if (!containerQueriesData[0][1]) {
        return;
      }

      //get query data of first waves container
      const _containerKey: string = containerQueriesData[0][1][0];
      const _queryKey = [QUERIES.WAVES.GET, _host, _containerKey, 0]
      const queryData: any[] | undefined = queryClient.getQueryData(_queryKey)

      console.log('query data', queryData);

      if (queryData && cacheCommentData) {
        queryData.splice(0, 0, cacheCommentData);
        queryClient.setQueryData(_queryKey, queryData);
      }
    },

    onSuccess: async (host) => {
      // TODO: get first container permlink here from initial containers
      const queriesData = queryClient.getQueriesData([QUERIES.WAVES.INITIAL_CONTAINERS, host]);
      const _queryKey = queriesData[0][0];
      queryClient.invalidateQueries(_queryKey);
    },
  };

  return useMutation(_mutationFn, _options);
};

export const fetchLatestWavesContainer = async (host) => {
  const query: any = {
    account: host,
    start_author: '',
    start_permlink: '',
    limit: 1,
    observer: '',
    sort: 'posts',
  };

  const result = await getAccountPosts(query);

  const _latestPost = result[0];
  console.log('lates waves post', host, _latestPost);

  if (!_latestPost) {
    throw new Error('Lates waves container could be not fetched');
  }

  return _latestPost;
};
