import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../../../../constants/routeNames';

import { getTrendingTags } from '../../../../../../providers/hive/dhive';
import { getLeaderboard } from '../../../../../../providers/ecency/ecency';
import { isCommunity } from '../../../../../../utils/communityValidation';

const OtherResultContainer = (props) => {
  const [tags, setTags] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const { children, navigation, searchValue } = props;

  useEffect(() => {
    if (searchValue.length <= 10) {
      setNoResult(false);
      setTags([]);
      getTrendingTags(searchValue.trim(), 100).then((res) => {
        const data = res?.filter((item) => !isCommunity(item.name));
        if (data.length === 0) {
          setNoResult(true);
        }
        setTags(data);
      });
    }
  }, [searchValue]);

  // Component Functions

  const _handleOnPress = (item) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.TAG_RESULT,
      params: {
        tag: get(item, 'name', ''),
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
