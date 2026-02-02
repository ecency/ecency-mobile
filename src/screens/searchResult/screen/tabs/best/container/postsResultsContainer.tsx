import { useState, useEffect } from 'react';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';

import {
  getPostQueryOptions,
  getAccountPostsQueryOptions,
  getSearchQueryOptions,
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

  const currentAccountUsername = useAppSelector(selectCurrentAccountUsername);

  useEffect(() => {
    _fetchResults();
  }, [searchValue]);

  const _fetchResults = async () => {
    let _data: any = [];

    setNoResult(false);
    setData(_data);

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
        getSearchQueryOptions(`${searchValue} type:post`, sort, false),
      );
      // Handle response structure - SDK returns array directly
      _data = Array.isArray(res) ? res : res?.items || res?.results || [];
      // Only set scroll_id if response has metadata
      if (res && typeof res === 'object' && 'scroll_id' in res) {
        setScrollId(res.scroll_id);
      }
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
    if (scrollId && searchValue) {
      try {
        const queryClient = getQueryClient();
        // TODO: Verify if SDK supports scroll_id for pagination
        // Currently using basic search - may need SDK update for proper pagination
        const res = await queryClient.fetchQuery(
          getSearchQueryOptions(`${searchValue} type:post`, sort, false),
        );
        const newResults = Array.isArray(res) ? res : res?.items || res?.results || [];

        // Deduplicate by creating a Set of existing permlinks
        const existingPermlinks = new Set(data.map((item) => item.permlink));
        const filteredNewResults = newResults.filter(
          (item) => !existingPermlinks.has(item.permlink),
        );

        setData([...data, ...filteredNewResults]);
      } catch (error) {
        console.warn('Search Failed', error);
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
    })
  );
};

export default PostsResultsContainer;
