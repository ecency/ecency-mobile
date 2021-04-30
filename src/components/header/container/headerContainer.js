import React from 'react';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';
import has from 'lodash/has';

// Component
import { useDispatch, useSelector } from 'react-redux';
import HeaderView from '../view/headerView';

import { AccountContainer, ThemeContainer } from '../../../containers';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';

const HeaderContainer = ({
  selectedUser,
  isReverse,
  navigation,
  handleOnBackPress,
  hideUser,
  enableViewModeToggle,
}) => {
  const dispatch = useDispatch();

  //redux properties
  const isHideImages = useSelector((state) => state.ui.hidePostsThumbnails);

  const _handleOpenDrawer = () => {
    if (has(navigation, 'openDrawer') && typeof get(navigation, 'openDrawer') === 'function') {
      navigation.openDrawer();
    }
  };

  const _handleOnPressBackButton = () => {
    if (handleOnBackPress) {
      handleOnBackPress();
    }

    navigation.goBack();
  };

  const _handleViewModeTogglePress = () => {
    dispatch(hidePostsThumbnails(!isHideImages));
  };

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => (
        <AccountContainer>
          {({ currentAccount, isLoggedIn, isLoginDone }) => {
            const _user = isReverse && selectedUser ? selectedUser : currentAccount;

            return (
              <HeaderView
                displayName={get(_user, 'display_name')}
                handleOnPressBackButton={_handleOnPressBackButton}
                handleOnViewModePress={_handleViewModeTogglePress}
                handleOpenDrawer={_handleOpenDrawer}
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
                isLoginDone={isLoginDone}
                isReverse={isReverse}
                reputation={get(_user, 'reputation')}
                username={get(_user, 'name')}
                hideUser={hideUser}
                enableViewModeToggle={enableViewModeToggle}
              />
            );
          }}
        </AccountContainer>
      )}
    </ThemeContainer>
  );
};

export default withNavigation(HeaderContainer);
