import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';

import ROUTES from '../../../constants/routeNames';

import { search } from '../../../providers/esteem/esteem';

const PostResultContainer = (props) => {
  const [data, setData] = useState([]);
  const [filterIndex, setFilterIndex] = useState(0);
  const [sort, setSort] = useState('relevance');
  const [scrollId, setScrollId] = useState('');

  const { children, navigation, searchValue } = props;

  useEffect(() => {
    setData([]);

    if (searchValue) {
      search({ q: searchValue, sort }).then((res) => {
        setScrollId(res.scroll_id);
        setData(res.results);
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

export default withNavigation(PostResultContainer);
