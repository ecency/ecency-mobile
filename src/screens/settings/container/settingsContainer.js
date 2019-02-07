import React, { Component } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import AppCenter from 'appcenter';
import Push from 'appcenter-push';
import { Client } from 'dsteem';

// Realm
import {
  setTheme,
  setLanguage as setLanguage2DB,
  setCurrency as setCurrency2DB,
  setServer,
  setNotificationIsOpen,
  getExistUser,
} from '../../../realm/realm';

// Services and Actions
import {
  setLanguage,
  isNotificationOpen,
  setCurrency,
  setApi,
  isDarkTheme,
  openPinCodeModal,
} from '../../../redux/actions/applicationActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { setPushToken, getNodes } from '../../../providers/esteem/esteem';

// Middleware

// Constants
import { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';

// Utilities

// Component
import SettingsScreen from '../screen/settingsScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serverList: [],
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
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
        this._currencyChange(action);
        break;

      case 'language':
        dispatch(setLanguage(LANGUAGE_VALUE[action]));
        setLanguage2DB(LANGUAGE_VALUE[action]);
        break;

      case 'api':
        this._changeApi(action);
        break;

      default:
        break;
    }
  };

  _changeApi = async (action) => {
    const { dispatch, selectedApi } = this.props;
    const { serverList } = this.state;
    const server = serverList[action];
    let serverResp;
    let isError = false;
    const client = new Client(server, { timeout: 3000 });

    dispatch(setApi(server));

    try {
      serverResp = await client.database.getDynamicGlobalProperties();
    } catch (e) {
      isError = true;
      dispatch(toastNotification('Connection Failed!'));
    } finally {
      if (!isError) dispatch(toastNotification('Succesfuly connected!'));
    }

    if (!isError) {
      const localTime = new Date(new Date().toISOString().split('.')[0]);
      const serverTime = new Date(serverResp.time);
      const isAlive = localTime - serverTime < 15000;

      if (!isAlive) {
        dispatch(toastNotification('Server not available'));
        isError = true;

        this.setState({ apiCheck: false });
        return;
      }
    }

    if (isError) {
      dispatch(setApi(selectedApi));
    } else {
      setServer(server);
    }
  };

  _currencyChange = (action) => {
    const { dispatch } = this.props;

    dispatch(setCurrency(CURRENCY_VALUE[action]));
    setCurrency2DB(CURRENCY_VALUE[action]);
  };

  _handleToggleChanged = (action, actionType) => {
    const { dispatch } = this.props;

    switch (actionType) {
      case 'notification':
        this._handleNotification(action);
        break;

      case 'theme':
        dispatch(isDarkTheme(action));
        setTheme(action);
        break;
      default:
        break;
    }
  };

  _handleNotification = async (action) => {
    const { dispatch } = this.props;

    dispatch(isNotificationOpen(action));
    setNotificationIsOpen(action);

    const isPushEnabled = await Push.isEnabled();

    await Push.setEnabled(!isPushEnabled);
  };

  _handleButtonPress = (action, actionType) => {
    const { dispatch, setPinCodeState } = this.props;
    switch (actionType) {
      case 'pincode':
        setPinCodeState({ isReset: true });
        dispatch(openPinCodeModal());
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
        this._handleButtonPress(action, actionType);
        break;

      default:
        break;
    }
  };

  _setPushToken = async () => {
    const { isNotificationSettingsOpen, isLoggedIn, username } = this.props;
    if (isLoggedIn) {
      const token = await AppCenter.getInstallId();

      getExistUser().then((isExistUser) => {
        if (isExistUser) {
          const data = {
            username,
            token,
            system: Platform.OS,
            allows_notify: isNotificationSettingsOpen,
          };
          setPushToken(data);
        }
      });
    }
  };

  render() {
    const { serverList } = this.state;

    return (
      <SettingsScreen
        serverList={serverList}
        handleOnChange={this._handleOnChange}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  selectedLanguage: state.application.language,
  selectedApi: state.application.api,
  selectedCurrency: state.application.currency,
  isDarkTheme: state.application.isDarkTheme,
  isNotificationSettingsOpen: state.application.isNotificationOpen,
  isLoggedIn: state.application.isLoggedIn,
  username: state.account.currentAccount && state.account.currentAccount.name,
});

export default connect(mapStateToProps)(SettingsContainer);
