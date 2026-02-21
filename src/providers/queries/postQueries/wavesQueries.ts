import {
  QueryKey,
  UseMutationOptions,
  useMutation,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { unionBy, isArray } from 'lodash';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { getAccountPosts, getDiscussion, useDeleteComment } from '@ecency/sdk';

import QUERIES from '../queryKeys';
import { delay } from '../../../utils/editor';
import {
  injectPostCache,
  injectVoteCache,
  mapDiscussionToThreads,
  parseDiscussionCollection,
} from '../../../utils/postParser';
import { useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useBotAuthorsQuery } from './postQueries';
import { selectCurrentAccount, selectCurrentAccountMutes } from '../../../redux/selectors';
import { useAuthContext } from '../../sdk';

export const useWavesQuery = (host: string) => {
  const queryClient = useQueryClient();

  const cache = useAppSelector((state) => state.cache);
  const mutes = useAppSelector(selectCurrentAccountMutes);
  const currentAccount = useAppSelector(selectCurrentAccount);

  // TODO: import bot authors query here
  const botAuthorsQuery = useBotAuthorsQuery();

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
      // index at end is used to track query hydration
      queryKey: [QUERIES.WAVES.GET, host, pagePermlink, index],
      queryFn: () => _fetchWaves(pagePermlink),
      initialData: [],
      // Auto-refresh every 60 seconds for first page only (to get new waves)
      refetchInterval: index === 0 ? 60000 : false,
      // Refetch when window gains focus
      refetchOnWindowFocus: index === 0,
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
      if (_timeElapsed < 5000) {
        if (lastCacheUpdate.type === 'vote') {
          _injectPostCache(lastCacheUpdate.postPath);
        }
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

      const result =
        (await getAccountPosts(
          query.sort,
          query.account,
          query.start_author,
          query.start_permlink,
          query.limit,
          query.observer,
        )) || [];

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
    const response = await getDiscussion(host, pagePermlink, currentAccount?.username);
    const parsedResponse = response
      ? await parseDiscussionCollection(response, currentAccount?.username)
      : null;

    // inject vote cache here...
    const _cachedVotes = cacheRef.current.votesCollection;
    const _cResponse = injectPostCache(parsedResponse, _cachedVotes);

    const _threadedComments = await mapDiscussionToThreads(_cResponse, host, pagePermlink, 1);

    if (!_threadedComments) {
      throw new Error('Failed to parse waves');
    }

    const _filteredComments = _threadedComments.filter(
      (item) =>
        item.net_rshares >= 0 &&
        !item.stats?.gray &&
        !item.stats.hide &&
        !botAuthorsQuery.data.includes(item.author),
    );

    _filteredComments.sort((a, b) => (new Date(a.created) > new Date(b.created) ? -1 : 1));
    _filteredComments.forEach((item) => {
      wavesIndexCollection.current[`${item.author}/${item.permlink}`] = pagePermlink;
    });

    console.log('new waves fetched', _filteredComments);

    return _filteredComments || [];
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
      _fetchPermlinks(permlinksBucket[permlinksBucket.length - 1]);
    }
  };

  const _refresh = async () => {
    setIsRefreshing(true);
    setPermlinksBucket([]);
    setActivePermlinks([]);
    await _fetchPermlinks('', true);
    // Wait for next tick to allow activePermlinks to update before refetching
    if (wavesQueries[0]?.refetch) {
      await wavesQueries[0].refetch();
    }
    setIsRefreshing(false);
  };

  const _data = unionBy(...wavesQueries.map((query) => query.data), 'url');

  const _filteredData = useMemo(
    () =>
      _data.filter((post) => {
        let _status = true;
        // discard wave if author is muted
        if (isArray(mutes) && mutes.indexOf(post?.author) > 0) {
          _status = false;
        }

        // discard if wave is downvoted or marked gray
        else if (post.isMuted) {
          _status = false;
        }

        return _status;
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

    const _latestData: any[] = queryResponse.data || [];

    // Guard against empty _filteredData - if no previous waves, return first 5 new waves
    if (!_prevLatestWave) {
      return _latestData?.slice(0, 5) || [];
    }

    // check if new waves are available
    const _lastIndex = _latestData?.findIndex(
      (item) => item.author + item.permlink === _prevLatestWave.author + _prevLatestWave.permlink,
    );

    let _newWaves: any[] = [];
    if (_lastIndex && _lastIndex !== 0) {
      if (_lastIndex < 0) {
        _newWaves = _latestData?.slice(0, 5) || [];
      } else {
        _newWaves = _latestData?.slice(0, _lastIndex) || [];
      }
    }

    return _newWaves;
  };

  // wave delete mutation to delete wave and update query
  const deleteMutation = useDeleteWaveMutation(host, activePermlinks, wavesQueries);

  return {
    data: _filteredData,
    isRefreshing,
    isLoading: isLoading || _lastItem?.isLoading || _lastItem?.isFetching,
    fetchNextPage: _fetchNextPage,
    latestWavesFetch: _lastestWavesFetch,
    refresh: _refresh,
    deleteWave: deleteMutation.mutate,
  };
};

export const useDeleteWaveMutation = (
  host: string,
  activePermlinks: string[],
  wavesQueries: any[],
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const intl = useIntl();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const sdkDeleteMutation = useDeleteComment(currentAccount?.name, authContext);

  return useMutation({
    mutationFn: async ({
      _permlink,
      _parent_permlink,
    }: {
      _permlink: string;
      _parent_permlink: string;
    }) => {
      if (!currentAccount?.name) {
        throw new Error('No authenticated user');
      }

      await sdkDeleteMutation.mutateAsync({
        author: currentAccount.name,
        permlink: _permlink,
        parentAuthor: host,
        parentPermlink: _parent_permlink,
      });

      return { _permlink, _parent_permlink };
    },
    onSuccess: ({ _permlink, _parent_permlink }) => {
      // find container index based on _parent_permlink of comment/wave being deleted
      const _containerIndex = activePermlinks.indexOf(_parent_permlink);
      if (_containerIndex >= 0) {
        // get query data from wavesQueries based on container index
        const _qData: any[] | undefined = wavesQueries[_containerIndex]?.data;
        // create query key for updating query data
        const _qKey = [QUERIES.WAVES.GET, host, _parent_permlink, _containerIndex];
        if (_qData && _qData.length > 0) {
          // filter out comment/wave which is deleted and set query data
          const _updatedData = _qData.filter((w) => w.permlink !== _permlink);
          queryClient.setQueryData(_qKey, _updatedData);
        }
      }
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    onError: (error) => {
      console.log('Failed to delete wave:', error);
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.error' })));
    },
  });
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
      const containerQueriesData: [QueryKey, string[] | undefined][] = queryClient.getQueriesData({
        queryKey: [QUERIES.WAVES.INITIAL_CONTAINERS, _host],
      });

      if (!containerQueriesData[0][1]) {
        return;
      }

      // get query data of first waves container
      const _containerKey: string = containerQueriesData[0][1][0];
      const _queryKey = [QUERIES.WAVES.GET, _host, _containerKey, 0];
      const queryData: any[] | undefined = queryClient.getQueryData(_queryKey);

      console.log('query data', queryData);

      if (queryData && cacheCommentData) {
        queryData.splice(0, 0, cacheCommentData);
        queryClient.setQueryData(_queryKey, queryData);
      }
    },

    onSuccess: async (host) => {
      // TODO: get first container permlink here from initial containers
      const queriesData = queryClient.getQueriesData({
        queryKey: [QUERIES.WAVES.INITIAL_CONTAINERS, host],
      });
      const _queryKey = queriesData[0][0];
      queryClient.invalidateQueries({ queryKey: _queryKey });
    },
  };

  return useMutation({ mutationFn: _mutationFn, ..._options });
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

  const result =
    (await getAccountPosts(
      query.sort,
      query.account,
      query.start_author,
      query.start_permlink,
      query.limit,
      query.observer,
    )) || [];

  const _latestPost = result[0];
  console.log('latest waves post', host, _latestPost);

  if (!_latestPost) {
    throw new Error('Latest waves container could not be fetched');
  }

  return _latestPost;
};
