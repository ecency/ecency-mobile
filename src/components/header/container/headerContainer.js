import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities
import { getReputation } from '../../../utils/user';

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
      isLoggedIn, currentAccount, selectedUser, isReverse, isLoginDone,
    } = this.props;
    let displayName;
    let userName;
    let reputation;

    if (isReverse && selectedUser) {
      displayName = selectedUser.display_name;
      userName = selectedUser.name;
      reputation = getReputation(selectedUser.reputation);
    } else if (!isReverse) {
      displayName = currentAccount.display_name;
      userName = currentAccount.name;
      reputation = getReputation(currentAccount.reputation);
    }

    return (
      <HeaderView
        handleOnPressBackButton={this._handleOnPressBackButton}
        handleOpenDrawer={this._handleOpenDrawer}
        isLoggedIn={isLoggedIn}
        isReverse={isReverse}
        isLoginDone={isLoginDone}
        displayName={displayName}
        userName={userName}
        reputation={reputation}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(withNavigation(HeaderContainer));
