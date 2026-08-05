import { useState, useEffect, useRef } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { getSearchTopicsQueryOptions } from '@ecency/sdk';
import ROUTES from '../../../../../../constants/routeNames';
import { getQueryClient } from '../../../../../../providers/queries';

const OtherResultContainer = ({ children, searchValue }: any) => {
  const navigation = useNavigation();

  const [tags, setTags] = useState<any[]>([]);
  const [noResult, setNoResult] = useState(false);
  // See the people tab: an empty result and a failed lookup are different
  // answers and used to be reported with the same one.
  const [isError, setIsError] = useState(false);
  const requestSequence = useRef(0);

  useEffect(() => {
    const requestId = ++requestSequence.current;
    const queryClient = getQueryClient();
    const trimmed = searchValue?.trim();

    if (!trimmed) {
      setNoResult(false);
      setIsError(false);
      setTags([]);
      return () => {
        if (requestSequence.current === requestId) {
          requestSequence.current += 1;
        }
      };
    }

    setNoResult(false);
    setIsError(false);
    setTags([]);

    queryClient
      .fetchQuery(getSearchTopicsQueryOptions(trimmed, 20))
      .then((res) => {
        if (requestSequence.current !== requestId) {
          return;
        }
        if (res && res.length === 0) {
          setNoResult(true);
        }
        setTags(res);
      })
      .catch((error) => {
        if (requestSequence.current === requestId) {
          console.warn('[TopicsSearch] Lookup failed:', error);
          setIsError(true);
          setTags([]);
        }
      });

    return () => {
      if (requestSequence.current === requestId) {
        requestSequence.current += 1;
      }
    };
  }, [searchValue]);

  // Component Functions

  const _handleOnPress = (item: any) => {
    (navigation as any).navigate({
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
