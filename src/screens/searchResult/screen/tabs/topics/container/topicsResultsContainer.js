import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../../../../constants/routeNames';

import { searchTag } from '../../../../../../providers/ecency/ecency';
import { isCommunity } from '../../../../../../utils/communityValidation';

const OtherResultContainer = (props) => {
  const [tags, setTags] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const { children, navigation, searchValue } = props;

  useEffect(() => {
    if (searchValue && searchValue.length <= 10) {
      setNoResult(false);
      setTags([]);

      searchTag(searchValue.trim(), 20)
        .then((res) => {
          if (res && res.length === 0) {
            setNoResult(true);
          }
          setTags(res);
        })
        .catch((err) => {
          setNoResult(true);
          setTags([]);
        });
    } else {
      searchTag(searchValue.trim(), 20, 1)
        .then((res) => {
          if (res && res.length === 0) {
            setNoResult(true);
          }
          setTags(res);
        })
        .catch((err) => {
          setNoResult(true);
          setTags([]);
        });
    }
  }, [searchValue]);

  // Component Functions

  const _handleOnPress = (item) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.TAG_RESULT,
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

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(withNavigation(OtherResultContainer));
