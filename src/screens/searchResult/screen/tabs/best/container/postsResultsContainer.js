import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { useSelector } from 'react-redux';

import ROUTES from '../../../../../../constants/routeNames';

import { search, getPromotePosts } from '../../../../../../providers/ecency/ecency';
import { getPost, getAccountPosts } from '../../../../../../providers/hive/dhive';

const PostsResultsContainer = ({ children, navigation, searchValue }) => {
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
    // const promoteds = await getPromotePosts();
    // return await Promise.all(
    //   promoteds.map(async (item) => {
    //     const post = await getPost(
    //       get(item, 'author'),
    //       get(item, 'permlink'),
    //       currentAccountUsername,
    //       true,
    //     );
    //     post.author_rep = post.author_reputation;
    //     post.body = (post.summary && post.summary.substring(0, 130)) || '';
    //     // return await call to your function
    //     return post;
    //   }),
    // );
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
      routeName: ROUTES.SCREENS.POST,
      params: {
        author: get(item, 'author'),
        permlink: get(item, 'permlink'),
      },
      key: get(item, 'permlink'),
    });
  };

  const _loadMore = (index, value) => {
    if (scrollId && searchValue) {
      search({ q: `${searchValue} type:post`, sort, scroll_id: scrollId }).then((res) => {
        setData([...data, ...res.results]);
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

export default withNavigation(PostsResultsContainer);
