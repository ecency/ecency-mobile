import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { HeaderView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class HeaderContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleOpenDrawer = () => {
    const { navigation } = this.props;

    navigation.openDrawer();
  };

  _handleOnPressBackButton = () => {
    const { navigation } = this.props;

    navigation.goBack();
  };

  render() {
    const {
      isLoggedIn, currentUser, user, isReserve, isLoginDone,
    } = this.props;
    return (
      <HeaderView
        handleOnPressBackButton={this._handleOnPressBackButton}
        handleOpenDrawer={this._handleOpenDrawer}
        isLoggedIn={isLoggedIn}
        currentAccount={user || currentUser}
        isReserve={isReserve}
        isLoginDone={isLoginDone}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,

  currentUser: state.account.currentAccount,
});

export default connect(mapStateToProps)(withNavigation(HeaderContainer));
