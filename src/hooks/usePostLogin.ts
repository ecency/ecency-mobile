import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import persistAccountGenerator from '../utils/persistAccountGenerator';
import {
  addOtherAccount,
  setPrevLoggedInUsers,
  updateCurrentAccount,
} from '../redux/actions/accountAction';
import { fetchSubscribedCommunities } from '../redux/actions/communitiesAction';
import { login as loginAction } from '../redux/actions/applicationActions';
import { setFeedPosts, setInitPosts } from '../redux/actions/postsAction';
import { useAppSelector } from './index';
import { selectPrevLoggedInUsers } from '../redux/selectors';

export const usePostLoginActions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const prevLoggedInUsers = useAppSelector(selectPrevLoggedInUsers);

  // update previously loggedin users list,
  const _updatePrevLoggedInUsersList = (username) => {
    if (prevLoggedInUsers && prevLoggedInUsers.length > 0) {
      const userIndex = prevLoggedInUsers.findIndex((el) => el?.username === username);
      if (userIndex > -1) {
        const updatedPrevLoggedInUsers = [...prevLoggedInUsers];
        updatedPrevLoggedInUsers[userIndex] = { username, isLoggedOut: false };
        dispatch(setPrevLoggedInUsers(updatedPrevLoggedInUsers));
      } else {
        const u = { username, isLoggedOut: false };
        dispatch(setPrevLoggedInUsers([...prevLoggedInUsers, u]));
      }
    } else {
      const u = { username, isLoggedOut: false };
      dispatch(setPrevLoggedInUsers([u]));
    }
  };

  const updateAccountsData = (accountData) => {
    if (accountData) {
      const persistAccountData = persistAccountGenerator(accountData);

      dispatch(updateCurrentAccount({ ...accountData }));
      dispatch(fetchSubscribedCommunities(accountData.username));
      dispatch(addOtherAccount({ ...persistAccountData }));
      dispatch(loginAction(true));
      // Clear cached posts to show new account's feed
      dispatch(setInitPosts([]));
      dispatch(setFeedPosts([]));
      _updatePrevLoggedInUsersList(accountData.username);

      // Invalidate all queries that depend on the current user
      // This forces fresh data for the new account
      queryClient.invalidateQueries();
    } else {
      throw new Error('alert.unknow_error');
    }
  };

  return {
    updateAccountsData,
  };
};
