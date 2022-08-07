import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../../../../constants/routeNames';

import { search } from '../../../../../../providers/ecency/ecency';
import { getAccountPosts } from '../../../../../../providers/hive/dhive';

const PostsResultsContainer = ({ children, searchValue }) => {
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [sort, setSort] = useState('newest');
  const [scrollId, setScrollId] = useState('');
  const [noResult, setNoResult] = useState(false);

  const currentAccountUsername = useSelector((state) => state.account.currentAccount.username);

  useEffect(() => {
    setNoResult(false);
    setData([]);

    if (searchValue) {
      search({ q: `${searchValue} type:post`, sort })
        .then((res) => {
          if (res) {
            setScrollId(res.scroll_id);
            setData(res.results);
            if (res.results.length === 0) {
              setNoResult(true);
            }
          } else {
            setNoResult(true);
            setData([]);
          }
        })
        .catch((err) => {
          setNoResult(true);
          setData([]);
        });
    } else {
      getInitialPosts()
        .then((res) => {
          if (res) {
            if (res.length === 0) {
              setNoResult(true);
            }
            setData(res);
          } else {
            setNoResult(true);
            setData([]);
          }
        })
        .catch((err) => {
          setNoResult(true);
          setData([]);
        });
    }
  }, [searchValue]);

  const getInitialPosts = async () => {
    const options = {
      observer: currentAccountUsername,
      account: 'ecency',
      limit: 7,
      sort: 'blog',
    };

    return await getAccountPosts(options);
  };

  // Component Functions

  const _handleOnPress = (item) => {
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      params: {
        author: get(item, 'author'),
        permlink: get(item, 'permlink'),
      },
      key: get(item, 'permlink'),
    });
  };

  const _loadMore = (index, value) => {
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
