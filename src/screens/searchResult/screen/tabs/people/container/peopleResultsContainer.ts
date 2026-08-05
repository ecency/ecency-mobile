import { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { lookupAccountsQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import ROUTES from '../../../../../../constants/routeNames';
import postUrlParser from '../../../../../../utils/postUrlParser';
import { selectCurrentAccountName } from '../../../../../../redux/selectors';

const PeopleResultsContainer = ({ children, searchValue }: any) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [users, setUsers] = useState<any[]>([]);
  const [noResult, setNoResult] = useState(true);
  // A failed lookup is not an empty one. These used to share a single flag, so
  // an RPC that never answered was reported as "no such account".
  const [isError, setIsError] = useState(false);
  const requestSequence = useRef(0);

  useEffect(() => {
    const requestId = ++requestSequence.current;

    if (!searchValue) {
      setUsers([]);
      setNoResult(true);
      // Clearing the field is not a failed lookup. _lookupAccounts is the only
      // other place this resets and it does not run for an empty query, so
      // without this the previous failure's message stays on screen.
      setIsError(false);
      return () => {
        if (requestSequence.current === requestId) {
          requestSequence.current += 1;
        }
      };
    }

    // if serachValue is url parse author
    const { author } = postUrlParser(searchValue) || {};

    if (searchValue) {
      _lookupAccounts(author || searchValue, requestId);
    }

    return () => {
      if (requestSequence.current === requestId) {
        requestSequence.current += 1;
      }
    };
  }, [searchValue]);

  const _lookupAccounts = async (username: any, requestId: any) => {
    setNoResult(false);
    setIsError(false);
    setUsers([]);

    try {
      const usernames = await queryClient.fetchQuery(lookupAccountsQueryOptions(username));
      const accounts = usernames ?? [];
      if (requestSequence.current === requestId) {
        setUsers(accounts.map((name) => ({ name })));
        setNoResult(accounts.length === 0);
      }
    } catch (error) {
      if (requestSequence.current === requestId) {
        console.warn('[PeopleSearch] Lookup failed:', error);
        setIsError(true);
        setUsers([]);
      }
    }
  };

  // Component Functions

  const _handleOnPress = (item: any) => {
    (navigation as any).navigate({
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
      isError,
    })
  );
};

const mapStateToProps = (state: any) => ({
  username: selectCurrentAccountName(state),
});

export default connect(mapStateToProps)(PeopleResultsContainer);
