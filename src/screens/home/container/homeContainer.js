import React, { Component } from 'react';
import { connect } from 'react-redux';

// Component
import HomeScreen from '../screen/homeScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { isLoggedIn, isLoginDone, currentAccount } = this.props;

    return (
      <HomeScreen
        isLoggedIn={isLoggedIn}
        isLoginDone={isLoginDone}
        currentAccount={currentAccount}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(HomeContainer);
