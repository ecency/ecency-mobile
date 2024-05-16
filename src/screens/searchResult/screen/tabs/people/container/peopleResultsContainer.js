import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../../../../constants/routeNames';

import { searchAccount } from '../../../../../../providers/ecency/ecency';
import { lookupAccounts } from '../../../../../../providers/hive/dhive';

const PeopleResultsContainer = ({ children, searchValue, username, isUsername }) => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [userNames, setUsernames] = useState([]);
  const [noResult, setNoResult] = useState(false);

  useEffect(() => {
    setNoResult(false);
    setUsers([]);
    if (!searchValue) {
      setUsernames([]);
    }
    if (searchValue && isUsername) {
      _fetchUsernames(searchValue);
    }

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

  const _fetchUsernames = async (username) => {
    const users = await lookupAccounts(username);
    setUsernames(users);
  };

  // Component Functions

  const _handleOnPress = (item) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: {
        username: item.name,
      },
      key: item.text,
    });
  };

  return (
    children &&
    children({
      users,
      userNames,
      handleOnPress: _handleOnPress,
      noResult,
    })
  );
};

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(PeopleResultsContainer);
