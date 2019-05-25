import React, { Component } from 'react';
import { connect } from 'react-redux';

// Actions
import { getUserDataWithUsername } from '../../../realm/realm';
import { switchAccount } from '../../../providers/steem/auth';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';

import { logout } from '../../../redux/actions/applicationActions';

// Constanst
import { default as ROUTES } from '../../../constants/routeNames';

// Component
import SideMenuView from '../view/sideMenuView';

/*
 *               Props Name                              Description
 *@props -->     props name navigation                   coming from react-navigation
 *
 */

class SideMenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
    };
  }

  // Component Life Cycle Functions

  componentWillReceiveProps(nextProps) {
    const { isLoggedIn } = this.props;

    if (isLoggedIn) {
      this._createUserList(nextProps.otherAccounts);
    }
  }

  _createUserList = otherAccounts => {
    const { currentAccount } = this.props;

    const accounts = [];
    otherAccounts.forEach(element => {
      if (element.username !== currentAccount.name) {
        accounts.push({
          name: `@${element.username}`,
          username: element.username,
          id: element.username,
        });
      }
    });
    accounts.push({
      name: 'Add Account',
      route: ROUTES.SCREENS.LOGIN,
      icon: 'add',
      id: 'add_account',
    });
    this.setState({ accounts });
  };

  // Component Functions

  _navigateToRoute = (route = null) => {
    const { navigation } = this.props;
    if (route) {
      navigation.navigate(route);
    }
  };

  _switchAccount = (anchor = null) => {
    const { dispatch, currentAccount, navigation } = this.props;

    if (anchor !== currentAccount.name) {
      switchAccount(anchor).then(accountData => {
        const realmData = getUserDataWithUsername(anchor);
        const _currentAccount = accountData;

        _currentAccount.username = _currentAccount.name;
        _currentAccount.local = realmData[0];

        dispatch(updateCurrentAccount(_currentAccount));
        navigation.closeDrawer();
      });
    }
  };

  _handleLogout = () => {
    const { dispatch } = this.props;

    dispatch(logout());
  };

  render() {
    const { currentAccount, isLoggedIn } = this.props;
    const { accounts } = this.state;

    return (
      <SideMenuView
        navigateToRoute={this._navigateToRoute}
        isLoggedIn={isLoggedIn}
        userAvatar={null}
        accounts={accounts}
        currentAccount={currentAccount}
        switchAccount={this._switchAccount}
        handleLogout={this._handleLogout}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  otherAccounts: state.account.otherAccounts,
});

export default connect(mapStateToProps)(SideMenuContainer);
