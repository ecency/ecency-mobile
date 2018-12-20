import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import LoginScreen from '../screen/loginScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <LoginScreen {...this.props} />;
  }
}

const mapStateToProps = state => ({
  account: state.accounts,
});

export default connect(mapStateToProps)(LoginContainer);
