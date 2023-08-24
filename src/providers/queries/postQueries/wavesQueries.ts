
import {
  UseMutationOptions,
  useMutation,
  useQueries, useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { unionBy } from 'lodash';
import { getComments } from '../../hive/dhive';

import { getAccountPosts } from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { delay } from '../../../utils/editor';
import { useAppSelector } from '../../../hooks';



export const useWavesQuery = (host: string) => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePermlinks, setActivePermlinks] = useState<string[]>([]);
  const [permlinksBucket, setPermlinksBucket] = useState<string[]>([]);




  // query initialization
  const wavesQueries = useQueries({
    queries: activePermlinks.map((pagePermlink, index) => ({
      queryKey: [QUERIES.WAVES.GET, host, index],
      queryFn: () => _fetchWaves(pagePermlink),
      initialData: [],
    })),
  });




  useEffect(() => {
    _fetchPermlinks()
  }, [])


  useEffect(() => {
    if (!!permlinksBucket.length) {
      activePermlinks.push(permlinksBucket[activePermlinks.length]);
      setActivePermlinks([...activePermlinks]);
    }
  }, [permlinksBucket])



  const _fetchPermlinks = async (startPermlink = '', refresh = false) => {
    setIsLoading(true);
    try {
      const query: any = {
        account: host,
        start_author: !!startPermlink ? host : '',
        start_permlink: startPermlink,
        limit: 10,
        observer: '',
        sort: 'posts',
      };

      const result = await getAccountPosts(query);

      const _fetchedPermlinks = result.map(post => post.permlink);
      console.log('permlinks fetched', _fetchedPermlinks);

      const _permlinksBucket = refresh ? _fetchedPermlinks : [...permlinksBucket, ..._fetchedPermlinks];
      setPermlinksBucket(_permlinksBucket);

      if (refresh) {
        //precautionary delay of 200ms to let state update before concluding promise,
        //it is effective for waves refresh routine.
        await delay(200)
      }
    } catch (err) {
      console.warn("failed to fetch waves permlinks");
    }

    setIsLoading(false)
  }

  const _fetchWaves = async (pagePermlink: string) => {
    console.log('fetching waves from:', host, pagePermlink);
    const response = await getComments(host, pagePermlink);
    response.sort((a, b) => new Date(a.created) > new Date(b.created) ? -1 : 1);
    console.log('new waves fetched', response);
    return response || [];
  };


  const _refresh = async () => {
    setIsRefreshing(true);
    setPermlinksBucket([]);
    setActivePermlinks([]);
    await _fetchPermlinks('', true);
    await wavesQueries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    const lastPage = wavesQueries.lastItem;

    if (!lastPage || lastPage.isFetching) {
      return;
    }

    const _nextPagePermlink = permlinksBucket[activePermlinks.length];

    //TODO: find a way to proactively refill active permlinks here.

    if (_nextPagePermlink && !activePermlinks.includes(_nextPagePermlink)) {
      activePermlinks.push(_nextPagePermlink);
      setActivePermlinks([...activePermlinks]);
    } else {
      _fetchPermlinks(permlinksBucket.lastItem)
    }
  };

  const _dataArrs = wavesQueries.map((query) => query.data);

  return {
    data: unionBy(..._dataArrs, 'url'),
    isRefreshing,
    isLoading: isLoading || wavesQueries.lastItem?.isLoading || wavesQueries.lastItem?.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
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
    throw new Error("Lates waves container could be not fetched");
  }

  return _latestPost;
}




export const usePublishWaveMutation = () => {

  const queryClient = useQueryClient();

  // const cachedComments = useAppSelector(state => state.cache.commentsCollection);

  // id is options, if no id is provided program marks all notifications as read;
  const _mutationFn = async (cachePostData: any) => {
    //TODO: lates port wave publishing here or introduce post publishing mutation;
    if(cachePostData){ //TODO: expand to check multiple wave hosts;{
      const _host = cachePostData.parent_author;
 
      console.log('returning waves host', _host);
      return _host;
    }

    throw new Error("invalid mutations data")
    
  };

  const _options: UseMutationOptions<string, unknown, any, void> = {
    onMutate: async (cacheCommentData:any) => {
      // TODO: find a way to optimise mutations by avoiding too many loops
      console.log('on mutate data', cacheCommentData);

      const _host = cacheCommentData.parent_author;

      // update query data
      const _queryKey = [ QUERIES.WAVES.GET, _host, 0];
      const queryData: any[] | undefined = queryClient.getQueryData(_queryKey);

      console.log('query data', queryData);

      if (queryData && cacheCommentData) {
        queryData.splice(0, 0, cacheCommentData);
        queryClient.setQueryData(_queryKey, queryData);
      }

    },

    onSuccess: async (host) => {
      await delay(5000);
      queryClient.invalidateQueries([QUERIES.WAVES.GET, host, 0]);
    },
  };

  return useMutation(_mutationFn, _options);
};
