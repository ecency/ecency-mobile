import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// Actions
import { useDrawerStatus } from '@react-navigation/drawer';
import { SheetManager } from 'react-native-actions-sheet';
import * as Sentry from '@sentry/react-native';
import { getAccountFullQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '../../../redux/actions/uiAction';
import { setInitPosts, setFeedPosts } from '../../../redux/actions/postsAction';

// Component
import SideMenuView from '../view/sideMenuView';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectIsLoggedIn,
  selectCurrentAccount,
  selectPrevLoggedInUsers,
} from '../../../redux/selectors';
import { useAppSelector } from '../../../hooks';

const SideMenuContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const drawerStatus = useDrawerStatus();
  const queryClient = useQueryClient();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const prevLoggedInUsers = useAppSelector(selectPrevLoggedInUsers);

  useEffect(() => {
    if (drawerStatus === 'open') {
      // update profile on drawer open
      _updateUserData();
    }
  }, [drawerStatus]);

  // fetches and update user data
  const _updateUserData = async () => {
    try {
      if (currentAccount?.name) {
        const accountData = await queryClient.fetchQuery(
          getAccountFullQueryOptions(currentAccount.name),
        );
        if (accountData) {
          dispatch(updateCurrentAccount({ ...currentAccount, ...accountData }));
        }
      }
    } catch (err) {
      console.warn('failed to update user data');
      Sentry.captureException(err);
    }
  };

  const _navigateToRoute = (route = null) => {
    if (route) {
      navigation.navigate(route);
      navigation.closeDrawer();
    }
  };

  const _handleLogout = () => {
    navigation.closeDrawer();
    dispatch(setFeedPosts([]));
    dispatch(setInitPosts([]));
    dispatch(logout());
  };

  const _handleShowAccountsSheet = () => {
    SheetManager.show(SheetNames.ACCOUNTS_SHEET);
    navigation.closeDrawer();
  };

  return (
    <SideMenuView
      navigateToRoute={_navigateToRoute}
      isLoggedIn={isLoggedIn}
      userAvatar={null}
      currentAccount={currentAccount}
      handleLogout={_handleLogout}
      handleShowAccountsSheet={_handleShowAccountsSheet}
      prevLoggedInUsers={prevLoggedInUsers}
    />
  );
};

export default SideMenuContainer;
