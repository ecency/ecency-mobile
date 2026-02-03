import { useState, useEffect } from 'react';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';

import {
  getPostQueryOptions,
  getAccountPostsQueryOptions,
  getSearchApiInfiniteQueryOptions,
  search,
} from '@ecency/sdk';
import ROUTES from '../../../../../../constants/routeNames';

import { getQueryClient, postQueries } from '../../../../../../providers/queries';
import postUrlParser from '../../../../../../utils/postUrlParser';
import { selectCurrentAccountUsername } from '../../../../../../redux/selectors';
import { useAppSelector } from '../../../../../../hooks';

const PostsResultsContainer = ({ children, searchValue }) => {
  const navigation = useNavigation();
  const postsCacherPrimer = postQueries.usePostsCachePrimer();

  const [data, setData] = useState<any>([]);
  const [sort] = useState('newest');
  const [scrollId, setScrollId] = useState('');
  const [noResult, setNoResult] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const currentAccountUsername = useAppSelector(selectCurrentAccountUsername);

  useEffect(() => {
    _fetchResults();
  }, [searchValue]);

  const normalizeSearchResponse = (res) => {
    if (!res) {
      return { results: [], scrollId: '' };
    }
    if (Array.isArray(res)) {
      return { results: res, scrollId: '' };
    }
    if (res.pages && Array.isArray(res.pages)) {
      const { pages } = res;
      const results = pages.flatMap((page) => page?.results || page?.items || []);
      const lastPage = pages[pages.length - 1];
      return { results, scrollId: lastPage?.scroll_id || '' };
    }
    if (Array.isArray(res.results)) {
      return { results: res.results, scrollId: res.scroll_id || '' };
    }
    if (Array.isArray(res.items)) {
      return { results: res.items, scrollId: res.scroll_id || '' };
    }
    return { results: [], scrollId: '' };
  };

  const _fetchResults = async () => {
    let _data: any = [];

    setNoResult(false);
    setData(_data);
    setScrollId('');

    // parse author and permlink if url
    const { author, permlink } = postUrlParser(searchValue) || {};

    // fetch based on post url
    if (author && permlink) {
      const queryClient = getQueryClient();
      const post = await queryClient.fetchQuery(
        getPostQueryOptions(author, permlink, currentAccountUsername),
      );
      _data = post ? [post] : [];
    }
    // search with query
    else if (searchValue) {
      const queryClient = getQueryClient();
      const res = await queryClient.fetchQuery(
        getSearchApiInfiniteQueryOptions(`${searchValue} type:post`, sort, false),
      );
      const normalized = normalizeSearchResponse(res);
      _data = normalized.results;
      setScrollId(normalized.scrollId);
    }
    // get initial posts if not search value
    else {
      _data = await getInitialPosts();
    }

    setData(_data);
    setNoResult(_data.length === 0);
  };

  const getInitialPosts = async () => {
    const queryClient = getQueryClient();
    return queryClient.fetchQuery(
      getAccountPostsQueryOptions(
        'ecency',
        'blog',
        undefined,
        undefined,
        7,
        currentAccountUsername,
      ),
    );
  };

  // Component Functions

  const _handleOnPress = (item) => {
    postsCacherPrimer.cachePost(item);
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      params: {
        author: get(item, 'author'),
        permlink: get(item, 'permlink'),
      },
      key: get(item, 'permlink'),
    });
  };

  const _loadMore = async () => {
    if (!scrollId || !searchValue || isLoadingMore) {
      return;
    }
    try {
      setIsLoadingMore(true);
      const res = await search(`${searchValue} type:post`, sort, 0, undefined, scrollId);
      const newResults = normalizeSearchResponse(res).results;
      const nextScrollId =
        res && typeof res === 'object' && 'scroll_id' in res ? res.scroll_id || '' : '';

      // Use functional updater to avoid stale closure reads
      setData((prev) => {
        const existingPermlinks = new Set(prev.map((item) => item.permlink));
        const filteredNewResults = newResults.filter(
          (item) => !existingPermlinks.has(item.permlink),
        );
        return [...prev, ...filteredNewResults];
      });
      setScrollId(nextScrollId);
    } catch (error) {
      console.warn('Search Failed', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    children &&
    children({
      data,
      handleOnPress: _handleOnPress,
      loadMore: _loadMore,
      noResult,
    })
  );
};

export default PostsResultsContainer;
