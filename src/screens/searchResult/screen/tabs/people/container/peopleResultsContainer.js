import { useState, useEffect } from 'react';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../../../../constants/routeNames';

import { lookupAccounts } from '../../../../../../providers/hive/dhive';
import { getLeaderboard, searchAccount } from '../../../../../../providers/ecency/ecency';

const PeopleResultsContainer = (props) => {
  const [users, setUsers] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const { children, navigation, searchValue, username } = props;

  useEffect(() => {
    setNoResult(false);
    setUsers([]);

    if (searchValue) {
      searchAccount(searchValue).then((res) => {
        if (res.length === 0) {
          setNoResult(true);
        }
        setUsers(res);
      });
    } else {
      getLeaderboard().then((result) => {
        const sos = result.map((item) => {
          item.name = item._id;

          return item;
        });
        if (sos.length === 0) {
          setNoResult(true);
        }
        setUsers(sos);
      });
    }
  }, [searchValue]);

  // Component Functions

  const _handleOnPress = (item) => {
    navigation.navigate({
      routeName: item === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE,
      params: {
        username: item,
      },
      key: item.text,
    });
  };

  return (
    children &&
    children({
      users,
      handleOnPress: _handleOnPress,
      noResult,
    })
  );
};

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(withNavigation(PeopleResultsContainer));
