import React, { Component } from 'react';
import { connect } from 'react-redux';

// Actions
import { getUserDataWithUsername } from '../../../realm/realm';
import { switchAccount } from '../../../providers/hive/auth';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';

import { logout, isRenderRequired } from '../../../redux/actions/applicationActions';

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

  _createUserList = (otherAccounts) => {
    const { currentAccount } = this.props;

    const accounts = [];
    console.log(otherAccounts, 'otherAccounts');
    otherAccounts.forEach((element) => {
      if (element.username !== currentAccount.name) {
        accounts.push({
          name: `@${element.username}`,
          username: element.username,
          id: element.username,
          displayName: element.display_name,
        });
      }
    });
    // accounts.push({
    //   name: 'Add Account',
    //   route: ROUTES.SCREENS.LOGIN,
    //   icon: 'user-follow',
    //   id: 'add_account',
    // });
    this.setState({ accounts });
  };

  // Component Functions

  _navigateToRoute = (route = null) => {
    const { navigation } = this.props;
    if (route) {
      navigation.navigate(route);
    }
  };

  _switchAccount = async (switchingAccount = {}) => {
    const { dispatch, currentAccount, navigation, otherAccounts } = this.props;

    if (switchingAccount.username !== currentAccount.name) {
      navigation.closeDrawer();

      const accountData = otherAccounts.filter(
        (account) => account.username === switchingAccount.username,
      )[0];

      // control user persist whole data or just username
      if (accountData.name) {
        accountData.username = accountData.name;

        dispatch(updateCurrentAccount(accountData));
        dispatch(isRenderRequired(true));

        const upToDateCurrentAccount = await switchAccount(accountData.name);
        const realmData = await getUserDataWithUsername(accountData.name);

        upToDateCurrentAccount.username = upToDateCurrentAccount.name;
        upToDateCurrentAccount.local = realmData[0];

        dispatch(updateCurrentAccount(upToDateCurrentAccount));
      } else {
        const _currentAccount = await switchAccount(accountData.username);
        const realmData = await getUserDataWithUsername(accountData.username);

        _currentAccount.username = _currentAccount.name;
        _currentAccount.local = realmData[0];

        dispatch(updateCurrentAccount(_currentAccount));
        dispatch(isRenderRequired(true));
      }
    }
  };

  _handleLogout = () => {
    const { dispatch } = this.props;

    dispatch(logout());
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isLoggedIn } = this.props;

    if (isLoggedIn) {
      this._createUserList(nextProps.otherAccounts);
    }
  }

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

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  otherAccounts: state.account.otherAccounts,
});

export default connect(mapStateToProps)(SideMenuContainer);
