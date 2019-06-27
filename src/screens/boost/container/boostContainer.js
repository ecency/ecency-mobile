import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
// import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import BoostScreen from '../screen/boostScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class BoostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <BoostScreen />;
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(BoostContainer));
