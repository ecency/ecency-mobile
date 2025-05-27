import { useDispatch } from 'react-redux';
import persistAccountGenerator from '../utils/persistAccountGenerator';
import {
  addOtherAccount,
  setPrevLoggedInUsers,
  updateCurrentAccount,
} from '../redux/actions/accountAction';
import { fetchSubscribedCommunities } from '../redux/actions/communitiesAction';
import { login as loginAction } from '../redux/actions/applicationActions';
import { useAppSelector } from './index';

export const usePostLoginActions = () => {
  const dispatch = useDispatch();

  const prevLoggedInUsers = useAppSelector((state) => state.account.prevLoggedInUsers);

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
      _updatePrevLoggedInUsersList(accountData.username);
    } else {
      throw new Error('alert.unknow_error');
    }
  };

  return {
    updateAccountsData,
  };
};
