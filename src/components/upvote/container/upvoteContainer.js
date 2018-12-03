import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { UpvoteView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class UpvoteContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <UpvoteView {...this.props} />;
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(UpvoteContainer);
