import React, { Component } from 'react';
import { connect } from 'react-redux';

// Actions
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

import { logout } from '../../../redux/actions/applicationActions';

// Component
import SideMenuView from '../view/sideMenuView';

/*
 *               Props Name                              Description
 *@props -->     props name navigation                   coming from react-navigation
 *
 */

class SideMenuContainer extends Component {
  // Component Functions

  _navigateToRoute = (route = null) => {
    const { navigation } = this.props;
    if (route) {
      navigation.navigate(route);
    }
  };

  _handleLogout = () => {
    const { logout, navigation } = this.props;

    navigation.closeDrawer();
    logout();
  };

  _handlePressOptions = () => {
    const { toggleAccountsBottomSheet } = this.props;

    toggleAccountsBottomSheet();
  };

  render() {
    const { currentAccount, isLoggedIn } = this.props;

    return (
      <SideMenuView
        navigateToRoute={this._navigateToRoute}
        isLoggedIn={isLoggedIn}
        userAvatar={null}
        currentAccount={currentAccount}
        handleLogout={this._handleLogout}
        handlePressOptions={this._handlePressOptions}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  otherAccounts: state.account.otherAccounts,
});

const mapDispatchToProps = {
  toggleAccountsBottomSheet,
  logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(SideMenuContainer);
