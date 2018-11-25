import React, { Component } from 'react';
import { connect } from 'react-redux';

// Realm
import {
  setTheme,
  setLanguage as setLanguage2DB,
  setCurrency as setCurrency2DB,
  setServer,
  setNotificationIsOpen,
} from '../../../realm/realm';

// Services and Actions
import {
  setLanguage,
  isNotificationOpen,
  setCurrency,
  setApi,
  isDarkTheme,
} from '../../../redux/actions/applicationActions';
// Middleware

// Constants
import { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import API_VALUE from '../../../constants/options/api';

// Utilities

// Component
import { SettingsScreen } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleDropdownSelected = (action, actionType) => {
    const { dispatch } = this.props;

    switch (actionType) {
      case 'currency':
        dispatch(setCurrency(CURRENCY_VALUE[action]));
        setCurrency2DB(CURRENCY_VALUE[action]);
        break;

      case 'language':
        dispatch(setLanguage(LANGUAGE_VALUE[action]));
        setLanguage2DB(LANGUAGE_VALUE[action]);
        break;

      case 'api':
        dispatch(setApi(API_VALUE[action]));
        setServer(API_VALUE[action]);
        break;

      default:
        break;
    }
  };

  _handleToggleChanged = (action, actionType) => {
    const { dispatch } = this.props;

    switch (actionType) {
      case 'notification':
        dispatch(isNotificationOpen(action));
        setNotificationIsOpen(action);
        break;

      case 'theme':
        dispatch(isDarkTheme(action));
        setTheme(action);
        break;

      default:
        break;
    }
  };

  _handleOnChange = (action, type, actionType = null) => {
    const { dispatch, navigation } = this.props;

    switch (type) {
      case 'dropdown':
        this._handleDropdownSelected(action, actionType);
        break;

      case 'toggle':
        this._handleToggleChanged(action, actionType);
        break;

      case 'button':
        console.log(action + type);
        break;

      default:
        break;
    }
  };

  render() {
    return <SettingsScreen handleOnChange={this._handleOnChange} {...this.props} />;
  }
}

const mapStateToProps = state => ({
  selectedLanguage: state.application.language,
  selectedApi: state.application.api,
  selectedCurrency: state.application.currency,
  isNotificationOpen: state.application.isNotificationOpen,
  isDarkTheme: state.application.isDarkTheme,
});
export default connect(mapStateToProps)(SettingsContainer);
