import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { WalletDetailsView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class WalletContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    // const {} = this.props;

    return <WalletDetailsView {...this.props} />;
  }
}

// const mapStateToProps = state => ({
//   // user: state.user.user,
// });

export default WalletContainer;
