import React, { Component } from 'react';
import { AsyncStorage, Platform } from 'react-native';
import { connect } from 'react-redux';
import AppCenter from 'appcenter';

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
import { setPushToken } from '../../../providers/esteem/esteem';
import { getNodes } from '../../../providers/esteem/esteem';

// Middleware

// Constants
import { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import API_VALUE from '../../../constants/options/api';
import INITIAL from '../../../constants/initial';

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
  componentDidMount() {
    const { intl } = this.props;

    getNodes()
      .then((resp) => {
        this.setState({ serverList: resp });
      })
      .catch(() => {});
  }

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

  _setPushToken = async () => {
    const { notificationSettings, isLoggedIn, username } = this.props;
    if (isLoggedIn) {
      const token = await AppCenter.getInstallId();
      AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
        if (JSON.parse(result)) {
          const data = {
            username,
            token,
            system: Platform.OS,
            allows_notify: notificationSettings,
          };
          setPushToken(data);
        }
      });
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
  notificationSettings: state.application.isNotificationOpen,
  isLoggedIn: state.application.isLoggedIn,
  username: state.account.currentAccount && state.account.currentAccount.name,
});
export default connect(mapStateToProps)(SettingsContainer);
