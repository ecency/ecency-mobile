import { useState, useEffect, useRef } from 'react';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';

import {
  getPostQueryOptions,
  getAccountPostsQueryOptions,
  searchQueryOptions,
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
  const [sort] = useState('relevance');
  const [scrollId, setScrollId] = useState('');
  const [noResult, setNoResult] = useState(false);
  // Kept apart from noResult: a search that failed is not a search that found
  // nothing, and telling the user "no results" for a dropped request sends them
  // rewording a query that never ran.
  const [isError, setIsError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestSequence = useRef(0);

  const currentAccountUsername = useAppSelector(selectCurrentAccountUsername);

  useEffect(() => {
    const requestId = ++requestSequence.current;
    _fetchResults(requestId);

    return () => {
      if (requestSequence.current === requestId) {
        requestSequence.current += 1;
      }
    };
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

  const _fetchResults = async (requestId) => {
    let _data: any = [];

    setNoResult(false);
    setIsError(false);
    setData(_data);
    setScrollId('');
    setIsLoading(true);
    setIsLoadingMore(false);

    try {
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
          searchQueryOptions(`${searchValue} type:post`, sort, '0'),
        );
        const normalized = normalizeSearchResponse(res);
        _data = normalized.results;
        if (requestSequence.current === requestId) {
          setScrollId(normalized.scrollId);
        }
      }
      // get initial posts if not search value
      else {
        _data = await getInitialPosts();
      }

      if (requestSequence.current === requestId) {
        setData(_data);
        setNoResult(_data.length === 0);
      }
    } catch (error) {
      console.warn('[PostsSearch] Search failed:', error);
      if (requestSequence.current === requestId) {
        setData([]);
        setIsError(true);
      }
    } finally {
      if (requestSequence.current === requestId) {
        setIsLoading(false);
      }
    }
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
    const author = get(item, 'author');
    const permlink = get(item, 'permlink');

    postsCacherPrimer.cachePost(item);
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      params: {
        author,
        permlink,
      },
      key: `${author}/${permlink}`,
    });
  };

  const _loadMore = async () => {
    if (!scrollId || !searchValue || isLoadingMore) {
      return;
    }
    const requestId = requestSequence.current;
    try {
      setIsLoadingMore(true);
      const res = await search(`${searchValue} type:post`, sort, '0', undefined, scrollId);
      const newResults = normalizeSearchResponse(res).results;
      const nextScrollId =
        res && typeof res === 'object' && 'scroll_id' in res ? res.scroll_id || '' : '';

      if (requestSequence.current !== requestId) {
        return;
      }

      // Use functional updater to avoid stale closure reads
      setData((prev) => {
        // author + permlink: a permlink is only unique per author, and two
        // authors sharing one ("re-...", the same slugified title) is common
        // enough that deduping on it alone dropped legitimate results.
        const seen = new Set(prev.map((item) => `${item.author}/${item.permlink}`));
        const filteredNewResults = newResults.filter(
          (item) => !seen.has(`${item.author}/${item.permlink}`),
        );
        return [...prev, ...filteredNewResults];
      });
      setScrollId(nextScrollId);
    } catch (error) {
      if (requestSequence.current === requestId) {
        console.warn('Search Failed', error);
      }
    } finally {
      if (requestSequence.current === requestId) {
        setIsLoadingMore(false);
      }
    }
  };

  return (
    children &&
    children({
      data,
      handleOnPress: _handleOnPress,
      loadMore: _loadMore,
      noResult,
      isError,
      isLoading,
    })
  );
};

export default PostsResultsContainer;
