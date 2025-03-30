import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import ROUTES from '../../../../../../constants/routeNames';

import { search } from '../../../../../../providers/ecency/ecency';
import { getAccountPosts, getPost } from '../../../../../../providers/hive/dhive';
import { postQueries } from '../../../../../../providers/queries';
import postUrlParser from '../../../../../../utils/postUrlParser';

const PostsResultsContainer = ({ children, searchValue }) => {
  const navigation = useNavigation();
  const postsCacherPrimer = postQueries.usePostsCachePrimer();

  const [data, setData] = useState<any>([]);
  const [sort] = useState('newest');
  const [scrollId, setScrollId] = useState('');
  const [noResult, setNoResult] = useState(false);

  const currentAccountUsername = useSelector((state) => state.account.currentAccount.username);

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
      const post = await getPost(author, permlink);
      _data = post ? [post] : [];
    }
    // search with query
    else if (searchValue) {
      const res = await search({ q: `${searchValue} type:post`, sort });
      _data = res.results || [];
      setScrollId(res.scroll_id);
    }
    // get initial posts if not search value
    else {
      _data = await getInitialPosts();
    }

    setData(_data);
    setNoResult(_data.length === 0);
  };

  const getInitialPosts = async () => {
    const options = {
      observer: currentAccountUsername,
      account: 'ecency',
      limit: 7,
      sort: 'blog',
    };

    return getAccountPosts(options);
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

  const _loadMore = () => {
    if (scrollId && searchValue) {
      search({ q: `${searchValue} type:post`, sort, scroll_id: scrollId })
        .then((res) => {
          setData([...data, ...res.results]);
        })
        .catch(() => {
          console.warn('Search Failed');
        });
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
