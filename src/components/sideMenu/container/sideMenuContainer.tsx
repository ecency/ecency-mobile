import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Actions
import { useDrawerStatus } from '@react-navigation/drawer';
import { logout, toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';
import { setInitPosts, setFeedPosts } from '../../../redux/actions/postsAction';

// Component
import SideMenuView from '../view/sideMenuView';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { getUser } from '../../../providers/hive/dhive';
import bugsnapInstance from '../../../config/bugsnag';

const SideMenuContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const drawerStatus = useDrawerStatus();

  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const prevLoggedInUsers = useSelector((state) => state.account.prevLoggedInUsers);

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );

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
      bugsnapInstance.notify(err);
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

  const _handlePressOptions = () => {
    navigation.closeDrawer();
    dispatch(toggleAccountsBottomSheet(!isVisibleAccountsBottomSheet));
  };

  return (
    <SideMenuView
      navigateToRoute={_navigateToRoute}
      isLoggedIn={isLoggedIn}
      userAvatar={null}
      currentAccount={currentAccount}
      handleLogout={_handleLogout}
      handlePressOptions={_handlePressOptions}
      prevLoggedInUsers={prevLoggedInUsers}
      isVisibleAccountsBottomSheet={isVisibleAccountsBottomSheet}
    />
  );
};

export default SideMenuContainer;
