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
  // See the people tab: an empty result and a failed lookup are different
  // answers and used to be reported with the same one.
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const queryClient = getQueryClient();
    const trimmed = searchValue?.trim();

    if (!trimmed) {
      setNoResult(false);
      setIsError(false);
      setTags([]);
      return;
    }

    setNoResult(false);
    setIsError(false);
    setTags([]);

    queryClient
      .fetchQuery(getSearchTopicsQueryOptions(trimmed, 20))
      .then((res) => {
        if (res && res.length === 0) {
          setNoResult(true);
        }
        setTags(res);
      })
      .catch((error) => {
        console.warn('[TopicsSearch] Lookup failed:', error);
        setIsError(true);
        setTags([]);
      });
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
      isError,
    })
  );
};

export default connect(null)(OtherResultContainer);
