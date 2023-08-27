import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../../../../constants/routeNames';

import { searchAccount } from '../../../../../../providers/ecency/ecency';

const PeopleResultsContainer = ({ children, searchValue, username }) => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [noResult, setNoResult] = useState(false);

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
      handleOnPress: _handleOnPress,
      noResult,
    })
  );
};

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(PeopleResultsContainer);
