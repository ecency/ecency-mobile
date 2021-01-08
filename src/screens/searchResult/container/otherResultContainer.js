import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../constants/routeNames';

import { lookupAccounts, getTrendingTags } from '../../../providers/hive/dhive';
import { getLeaderboard } from '../../../providers/ecency/ecency';

const OtherResultContainer = (props) => {
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [filterIndex, setFilterIndex] = useState(0);

  const { children, navigation, searchValue, username } = props;

  useEffect(() => {
    setUsers([]);
    setTags([]);

    if (searchValue) {
      lookupAccounts(searchValue.replace(/\s+/g, '')).then((res) => {
        setUsers(res);
      });
      getTrendingTags(searchValue.replace(/\s+/g, '')).then((res) => {
        setTags(res);
      });
    } else {
      getLeaderboard().then((result) => {
        const sos = result.map((item) => item._id);
        setUsers(sos);
      });
    }
  }, [searchValue]);

  // Component Functions

  const _handleOnPress = (item) => {
    switch (filterIndex) {
      case 0:
        navigation.navigate({
          routeName: item === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE,
          params: {
            username: item,
          },
          key: item.text,
        });
        break;
      case 1:
        navigation.navigate({
          routeName: ROUTES.SCREENS.TAG_RESULT,
          params: {
            tag: get(item, 'name', ''),
          },
        });
        break;

      default:
        break;
    }
  };

  const _handleFilterChanged = (index, value) => {
    setFilterIndex(index);
  };

  return (
    children &&
    children({
      users,
      tags,
      filterIndex,
      handleOnPress: _handleOnPress,
      handleFilterChanged: _handleFilterChanged,
    })
  );
};

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(withNavigation(OtherResultContainer));
