import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../../../../constants/routeNames';

import { searchAccount } from '../../../../../../providers/ecency/ecency';
import { lookupAccounts } from '../../../../../../providers/hive/dhive';
import postUrlParser from '../../../../../../utils/postUrlParser';

const PeopleResultsContainer = ({ children, searchValue, isUsername }) => {
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

    //if serachValue is url
    const { author } = postUrlParser(searchValue) || {};

    if (searchValue ) {
      _fetchUsernames(author || searchValue);
    }


    // searchAccount(author || searchValue, 20, searchValue ? 0 : 1)
    //   .then((res) => {
    //     if (res && res.length === 0) {
    //       setNoResult(true);
    //     }
    //     setUsers(res.reverse());
    //   })
    //   .catch(() => {
    //     setNoResult(true);
    //     setUsers([]);
    //   });

    
  }, [searchValue, isUsername]);

  const _fetchUsernames = async (username) => {
    try {
      const users = await lookupAccounts(username);
      if (!users || users.length === 0) {
        throw new Error('No users found');
      }
      setUsernames(users);
    } catch (error) {
      setNoResult(true);
      setUsernames([]);
    }

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
