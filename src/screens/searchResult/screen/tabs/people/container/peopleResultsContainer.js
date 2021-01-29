import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import ROUTES from '../../../../../../constants/routeNames';

import { searchAccount } from '../../../../../../providers/ecency/ecency';

const PeopleResultsContainer = (props) => {
  const [users, setUsers] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const { children, navigation, searchValue, username } = props;

  useEffect(() => {
    setNoResult(false);
    setUsers([]);

    searchAccount(searchValue, 20, searchValue ? 0 : 1)
      .then((res) => {
        if (res && res.length === 0) {
          setNoResult(true);
        }
        setUsers(res);
      })
      .catch((err) => {
        setNoResult(true);
        setUsers([]);
      });
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
