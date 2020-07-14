import { useState, useEffect } from 'react';

import ROUTES from '../../../constants/routeNames';

import { getCommunities } from '../../../providers/steem/steem';

const CommunitiesContainer = (props) => {
  const [data, setData] = useState();
  const [filterIndex, setFilterIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('rank');

  const { children, navigation, searchValue } = props;

  useEffect(() => {
    setData([]);
    getCommunities('', 100, query, sort).then((res) => {
      if (res) {
        setData(res);
      }
    });
  }, [query, sort]);

  useEffect(() => {
    setData([]);
    setQuery(searchValue);
  }, [searchValue]);

  // Component Functions

  const _handleOnVotersDropdownSelect = (index, value) => {
    setFilterIndex(index);
    setSort(value);
  };

  const _handleOnUserPress = (username) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  return (
    children &&
    children({
      data,
      filterIndex,
      handleOnVotersDropdownSelect: _handleOnVotersDropdownSelect,
      handleOnUserPress: _handleOnUserPress,
    })
  );
};

export default CommunitiesContainer;
