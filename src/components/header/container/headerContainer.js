import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { get, has } from 'lodash';

// Component
import HeaderView from '../view/headerView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class HeaderContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleOpenDrawer = () => {
    const { navigation } = this.props;

    if (has(navigation, 'openDrawer') && typeof get(navigation, 'openDrawer') === 'function') {
      navigation.openDrawer();
    }
  };

  _handleOnPressBackButton = () => {
    const { navigation, handleOnBackPress } = this.props;

    if (handleOnBackPress) handleOnBackPress();

    navigation.goBack();
  };

  render() {
    const {
      isLoggedIn,
      currentAccount,
      selectedUser,
      isReverse,
      isLoginDone,
      isDarkTheme,
    } = this.props;
    const _user = isReverse && selectedUser ? selectedUser : currentAccount;

    const displayName = get(_user, 'display_name');
    const username = get(_user, 'name');
    const reputation = get(_user, 'reputation');

    return (
      <HeaderView
        handleOnPressBackButton={this._handleOnPressBackButton}
        handleOpenDrawer={this._handleOpenDrawer}
        isLoggedIn={isLoggedIn}
        isReverse={isReverse}
        isLoginDone={isLoginDone}
        displayName={displayName}
        username={username}
        reputation={reputation}
        isDarkTheme={isDarkTheme}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,
  isDarkTheme: state.application.isDarkTheme,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(withNavigation(HeaderContainer));
