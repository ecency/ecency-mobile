import React, { Component } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import AppCenter from 'appcenter';
import Push from 'appcenter-push';
import { Client } from 'dsteem';

// Realm
import {
  getExistUser,
  setCurrency as setCurrency2DB,
  setDefaultFooter,
  setLanguage as setLanguage2DB,
  setNotificationIsOpen,
  setNsfw as setNsfw2DB,
  setServer,
  setTheme,
} from '../../../realm/realm';

// Services and Actions
import {
  isDarkTheme,
  isDefaultFooter,
  isNotificationOpen,
  openPinCodeModal,
  setApi,
  setCurrency,
  setLanguage,
  setNsfw,
} from '../../../redux/actions/applicationActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { setPushToken, getNodes } from '../../../providers/esteem/esteem';
import { checkClient } from '../../../providers/steem/dsteem';
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

      case 'nsfw':
        dispatch(setNsfw(action));
        setNsfw2DB(action);
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

        return;
      }
    }

    if (isError) {
      dispatch(setApi(selectedApi));
    } else {
      await setServer(server);
      checkClient();
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

      case 'default_footer':
        dispatch(isDefaultFooter(action));
        // setDefaultFooter(action);
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
    this._setPushToken();
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
            allows_notify: Number(isNotificationSettingsOpen),
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
  isDarkTheme: state.application.isDarkTheme,
  isDefaultFooter: state.application.isDefaultFooter,
  isLoggedIn: state.application.isLoggedIn,
  isNotificationSettingsOpen: state.application.isNotificationOpen,
  nsfw: state.application.nsfw,
  selectedApi: state.application.api,
  selectedCurrency: state.application.currency,
  selectedLanguage: state.application.language,
  username: state.account.currentAccount && state.account.currentAccount.name,
});

export default connect(mapStateToProps)(SettingsContainer);
