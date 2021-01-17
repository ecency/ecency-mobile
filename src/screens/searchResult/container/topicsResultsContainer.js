import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../constants/routeNames';

import { getTrendingTags } from '../../../providers/hive/dhive';
import { getLeaderboard } from '../../../providers/ecency/ecency';
import { isCommunity } from '../../../utils/communityValidation';

const OtherResultContainer = (props) => {
  const [tags, setTags] = useState([]);

  const { children, navigation, searchValue, username } = props;

  useEffect(() => {
    setTags([]);

    getTrendingTags(searchValue).then((res) => {
      const data = res.filter((item) => !isCommunity(item.name));
      console.log(data, 'data');
      setTags(data);
    });
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
    })
  );
};

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(withNavigation(OtherResultContainer));
