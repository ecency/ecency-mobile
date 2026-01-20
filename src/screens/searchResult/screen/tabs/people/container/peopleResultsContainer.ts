import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { lookupAccountsQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import ROUTES from '../../../../../../constants/routeNames';
import postUrlParser from '../../../../../../utils/postUrlParser';
import { selectCurrentAccountName } from '../../../../../../redux/selectors';

const PeopleResultsContainer = ({ children, searchValue }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [users, setUsers] = useState([]);
  const [noResult, setNoResult] = useState(true);

  useEffect(() => {
    if (!searchValue) {
      setUsers([]);
    }

    // if serachValue is url parse author
    const { author } = postUrlParser(searchValue) || {};

    if (searchValue) {
      _lookupAccounts(author || searchValue);
    }
  }, [searchValue]);

  const _lookupAccounts = async (username) => {
    setNoResult(false);
    setUsers([]);

    try {
      const usernames = await queryClient.fetchQuery(lookupAccountsQueryOptions(username));
      if (!usernames || usernames.length === 0) {
        throw new Error('No users found');
      }
      setUsers(usernames.map((username) => ({ name: username })));
    } catch (error) {
      setNoResult(true);
      setUsers([]);
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
      handleOnPress: _handleOnPress,
      noResult,
    })
  );
};

const mapStateToProps = (state) => ({
  username: selectCurrentAccountName(state),
});

export default connect(mapStateToProps)(PeopleResultsContainer);
