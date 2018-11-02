import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getUserData } from '../../../realm/realm';
// Component
import { SideMenuView } from '..';

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

  componentWillMount() {
    const accounts = [];

    getUserData().then((userData) => {
      userData.forEach((element) => {
        accounts.push({ name: element.username, image: 'test' });
      });
      this.setState({ accounts });
    });
  }

  // Component Functions

  _navigateToRoute = (route = null) => {
    const { navigation } = this.props;
    navigation.navigate(route);
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
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(SideMenuContainer);
