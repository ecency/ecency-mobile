import React, { Component } from 'react';
import { AsyncStorage, Platform } from 'react-native';
import { connect } from 'react-redux';
import { addLocaleData } from 'react-intl';
import Config from 'react-native-config';
import AppCenter from 'appcenter';

// Constants
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';
import INITIAL from '../../../constants/initial';

// Services
import {
  getUserData,
  getAuthStatus,
  getSettings,
  getPushTokenSaved,
  setPushTokenSaved,
} from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';
import { setPushToken } from '../../../providers/esteem/esteem';

// Actions
import {
  addOtherAccount,
  updateCurrentAccount,
  updateUnreadActivityCount,
} from '../../../redux/actions/accountAction';
import {
  activeApplication,
  login,
  openPinCodeModal,
  setLanguage,
  isNotificationOpen,
  setCurrency,
  setApi,
  isDarkTheme,
} from '../../../redux/actions/applicationActions';

// Container
import { ApplicationScreen } from '..';

addLocaleData([...en, ...tr]);
/* eslint-disable */
// symbol polyfills
global.Symbol = require('core-js/es6/symbol');
require('core-js/fn/symbol/iterator');

// collection fn polyfills
require('core-js/fn/map');
require('core-js/fn/set');
require('core-js/fn/array/find');
/* eslint-enable */

class ApplicationContainer extends Component {
  constructor() {
    super();
    this.state = {
      isRenderRequire: true,
    };
  }

  componentDidMount = () => {
    this._getUserData();
    this._getSettings();
  };

  componentWillReceiveProps(nextProps) {
    const { isDarkTheme, selectedLanguage } = this.props;

    if (isDarkTheme !== nextProps.isDarkTheme || selectedLanguage !== nextProps.selectedLanguage) {
      this.setState({ isRenderRequire: false }, () => this.setState({ isRenderRequire: true }));
    }
  }

  _getUserData = () => {
    const { dispatch } = this.props;

    getAuthStatus().then((res) => {
      if (res.isLoggedIn) {
        getUserData().then((response) => {
          if (response.length > 0) {
            response.forEach((accountData) => {
              dispatch(
                addOtherAccount({ username: accountData.username, avatar: accountData.avatar }),
              );
            });
            getUser(response[response.length - 1].username)
              .then((accountData) => {
                const realmObject = response[response.length - 1];
                accountData.realm_object = realmObject;

                dispatch(login());
                dispatch(updateCurrentAccount(accountData));
                dispatch(activeApplication());
                if (__DEV__ === false) {
                  dispatch(openPinCodeModal());
                }
                this._connectNotificationServer(accountData.name);
                this._setPushToken(accountData.name);
              })
              .catch((err) => {
                alert(err);
              });
          }
        });
      } else {
        dispatch(activeApplication());
      }
    });
  };

  _getSettings = () => {
    const { dispatch } = this.props;

    getSettings().then((response) => {
      console.log('response :', response);
      if (response) {
        response.isDarkTheme && dispatch(isDarkTheme(response.isDarkTheme));
        response.language && dispatch(setLanguage(response.language));
        response.currency && dispatch(setCurrency(response.currency));
        response.notification && dispatch(isNotificationOpen(response.notification));
        response.server && dispatch(setApi(response.currency));
      }
    });
  };

  _connectNotificationServer = (username) => {
    const { dispatch, unreadActivityCount } = this.props;
    const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${username}`);

    ws.onmessage = (e) => {
      // a message was received
      console.log('e.data :', e.data);
      dispatch(updateUnreadActivityCount(unreadActivityCount + 1));
    };
  };

  _setPushToken = async (username) => {
    const { notificationSettings } = this.props;
    const token = await AppCenter.getInstallId();

    AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
      if (JSON.parse(result)) {
        getPushTokenSaved().then((isPushTokenSaved) => {
          if (!isPushTokenSaved) {
            const data = {
              username,
              token,
              system: Platform.OS,
              allows_notify: notificationSettings,
            };
            setPushToken(data).then(() => {
              setPushTokenSaved(JSON.stringify(true));
            });
          }
        });
      }
    });
  };

  render() {
    const { selectedLanguage } = this.props;
    const { isRenderRequire } = this.state;

    const locale = (navigator.languages && navigator.languages[0])
      || navigator.language
      || navigator.userLanguage
      || selectedLanguage;

    if (isRenderRequire) {
      return <ApplicationScreen locale={locale} {...this.props} />;
    }
    return null;
  }
}

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
  selectedLanguage: state.application.language,
  unreadActivityCount: state.account.currentAccount.unread_activity_count,
  notificationSettings: state.application.isNotificationOpen,
});

export default connect(mapStateToProps)(ApplicationContainer);
