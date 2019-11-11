import React from 'react';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';
import has from 'lodash/has';

// Component
import HeaderView from '../view/headerView';

import { AccountContainer, ThemeContainer } from '../../../containers';

const HeaderContainer = ({ selectedUser, isReverse, navigation, handleOnBackPress }) => {
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
                handleOpenDrawer={_handleOpenDrawer}
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
                isLoginDone={isLoginDone}
                isReverse={isReverse}
                reputation={get(_user, 'reputation')}
                username={get(_user, 'name')}
              />
            );
          }}
        </AccountContainer>
      )}
    </ThemeContainer>
  );
};

export default withNavigation(HeaderContainer);
