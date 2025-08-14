import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Actions
import { useDrawerStatus } from '@react-navigation/drawer';
import { SheetManager } from 'react-native-actions-sheet';
import * as Sentry from '@sentry/react-native';
import { logout } from '../../../redux/actions/uiAction';
import { setInitPosts, setFeedPosts } from '../../../redux/actions/postsAction';

// Component
import SideMenuView from '../view/sideMenuView';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { getUser } from '../../../providers/hive/dhive';
import { SheetNames } from '../../../navigation/sheets';

const SideMenuContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const drawerStatus = useDrawerStatus();

  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const prevLoggedInUsers = useSelector((state) => state.account.prevLoggedInUsers);

  useEffect(() => {
    if (drawerStatus === 'open') {
      // update profile on drawer open
      _updateUserData();
    }
  }, [drawerStatus]);

  // fetches and update user data
  const _updateUserData = async () => {
    try {
      if (currentAccount?.username) {
        const accountData = await getUser(currentAccount.username);
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
