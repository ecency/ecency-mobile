import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../constants/routeNames';

import { search, getPromotePosts } from '../../../providers/ecency/ecency';
import { getPost } from '../../../providers/hive/dhive';

const PostsResultsContainer = ({ children, navigation, searchValue, currentAccountUsername }) => {
  const [data, setData] = useState([]);
  const [sort, setSort] = useState('relevance');
  const [scrollId, setScrollId] = useState('');

  useEffect(() => {
    setData([]);

    if (searchValue) {
      search({ q: searchValue, sort })
        .then((res) => {
          setScrollId(res.scroll_id);
          setData(res.results);
        })
        .catch((err) => console.log(err, 'search error'));
    } else {
      getInitialPosts().then((res) => {
        console.log(res, 'res');
        // setData(res);
      });
    }
  }, [searchValue, sort]);

  const getInitialPosts = async () => {
    const promoteds = await getPromotePosts();

    return await Promise.all(
      promoteds.map(async (item) => {
        const post = await getPost(
          get(item, 'author'),
          get(item, 'permlink'),
          currentAccountUsername,
          true,
        );

        post.author_rep = post.author_reputation;
        post.body = (post.summary && post.summary.substring(0, 130)) || '';
        // return await call to your function
        return post;
      }),
    );
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
    if (scrollId) {
      search({ q: searchValue, sort, scroll_id: scrollId }).then((res) => {
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
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccountUsername: state.account.currentAccount.username,
});

export default connect(mapStateToProps)(withNavigation(PostsResultsContainer));
