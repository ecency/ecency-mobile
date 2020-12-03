import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../constants/routeNames';

import { search, getPromotePosts } from '../../../providers/ecency/ecency';
import { getPost } from '../../../providers/hive/dhive';

const PostResultContainer = ({ children, navigation, searchValue, currentAccountUsername }) => {
  const [data, setData] = useState([]);
  const [filterIndex, setFilterIndex] = useState(0);
  const [sort, setSort] = useState('relevance');
  const [scrollId, setScrollId] = useState('');

  useEffect(() => {
    setData([]);

    if (searchValue) {
      search({ q: searchValue, sort }).then((res) => {
        setScrollId(res.scroll_id);
        setData(res.results);
      });
    } else {
      getPromotePosts()
        .then((result) => {
          return Promise.all(
            result.map((item) =>
              getPost(
                get(item, 'author'),
                get(item, 'permlink'),
                currentAccountUsername,
                true,
              ).then((post) => {
                post.author_rep = post.author_reputation;
                post.body = (post.summary && post.summary.substring(0, 130)) || '';
                return post;
              }),
            ),
          );
        })
        .then((result) => {
          setData(result);
        });
    }
  }, [searchValue, sort]);

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

  const _handleFilterChanged = (index, value) => {
    setFilterIndex(index);
    setSort(value);
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
      filterIndex,
      handleOnPress: _handleOnPress,
      handleFilterChanged: _handleFilterChanged,
      loadMore: _loadMore,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccountUsername: state.account.currentAccount.username,
});

export default connect(mapStateToProps)(withNavigation(PostResultContainer));
