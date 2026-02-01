import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { getSearchTopicsQueryOptions } from '@ecency/sdk';
import ROUTES from '../../../../../../constants/routeNames';
import { getQueryClient } from '../../../../../../providers/queries';

const OtherResultContainer = ({ children, searchValue }) => {
  const navigation = useNavigation();

  const [tags, setTags] = useState([]);
  const [noResult, setNoResult] = useState(false);

  useEffect(() => {
    const queryClient = getQueryClient();

    if (searchValue) {
      setNoResult(false);
      setTags([]);

      queryClient
        .fetchQuery(getSearchTopicsQueryOptions(searchValue.trim(), 20))
        .then((res) => {
          if (res && res.length === 0) {
            setNoResult(true);
          }
          setTags(res);
        })
        .catch(() => {
          setNoResult(true);
          setTags([]);
        });
    }
  }, [searchValue]);

  // Component Functions

  const _handleOnPress = (item) => {
    navigation.navigate({
      name: ROUTES.SCREENS.TAG_RESULT,
      params: {
        tag: get(item, 'tag', ''),
      },
    });
  };

  return (
    children &&
    children({
      tags,
      handleOnPress: _handleOnPress,
      noResult,
    })
  );
};

export default connect(null)(OtherResultContainer);
