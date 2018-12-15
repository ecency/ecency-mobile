import React, { Component } from 'react';
import { Platform, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { addLocaleData } from 'react-intl';
import Config from 'react-native-config';
import AppCenter from 'appcenter';
import { NavigationActions } from 'react-navigation';

// Constants
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

// Services
import {
  getAuthStatus,
  getExistUser,
  getPushTokenSaved,
  getSettings,
  getUserData,
  removeUserData,
  setPushTokenSaved,
  getUserDataWithUsername,
} from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';
import { setPushToken } from '../../../providers/esteem/esteem';
import { switchAccount } from '../../../providers/steem/auth';

// Actions
import {
  addOtherAccount,
  updateCurrentAccount,
  updateUnreadActivityCount,
  removeOtherAccount
} from '../../../redux/actions/accountAction';
import {
  activeApplication,
  isDarkTheme,
  isLoginDone,
  isNotificationOpen,
  login,
  openPinCodeModal,
  setApi,
  setCurrency,
  setLanguage,
  setUpvotePercent,
  logoutDone,
} from '../../../redux/actions/applicationActions';

// Container
import { ApplicationScreen } from '..';

addLocaleData([...en, ...tr]);

class ApplicationContainer extends Component {
  constructor() {
    super();
    this.state = {
      isRenderRequire: true,
    };
  }

  componentDidMount = async () => {
    BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
    await this._getUserData();
    this._getSettings();
  };

  componentWillReceiveProps(nextProps) {
    const { isDarkTheme: _isDarkTheme, selectedLanguage, isLogingOut } = this.props;

    if (_isDarkTheme !== nextProps.isDarkTheme || selectedLanguage !== nextProps.selectedLanguage) {
      this.setState({ isRenderRequire: false }, () => this.setState({ isRenderRequire: true }));
    }

    if (isLogingOut !== nextProps.isLogingOut && nextProps.isLogingOut) {
      this._logout();
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  _onBackPress = () => {
    const { dispatch } = this.props;

    dispatch(NavigationActions.back());
    return true;
  };

  _getUserData = async () => {
    const { dispatch } = this.props;
    let realmData;
    let authStatus;
    let currentUsername;

    await getAuthStatus().then((res) => {
      authStatus = res;
      currentUsername = res.currentUsername;
      getUserData().then((userData) => {
        if (userData.length > 0) {
          realmData = userData;

          userData.forEach((accountData) => {
            dispatch(
              addOtherAccount({ username: accountData.username }),
            );
          });
        }
      });
    });

    if (realmData) {
      await getUser(currentUsername)
        .then((accountData) => {
          dispatch(login(true));

          const realmObject = realmData.filter(data => data.username === currentUsername);
          accountData.local = realmObject[0];

          dispatch(updateCurrentAccount(accountData));
          // If in dev mode pin code does not show
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

    dispatch(activeApplication());
    dispatch(isLoginDone());
  };

  _getSettings = () => {
    const { dispatch } = this.props;

    getSettings().then((response) => {
      if (response) {
        response.isDarkTheme && dispatch(isDarkTheme(response.isDarkTheme));
        response.language && dispatch(setLanguage(response.language));
        response.currency && dispatch(setCurrency(response.currency));
        response.notification && dispatch(isNotificationOpen(response.notification));
        response.server && dispatch(setApi(response.server));
        response.upvotePercent && dispatch(setUpvotePercent(Number(response.upvotePercent)));
      }
    });
  };

  _connectNotificationServer = (username) => {
    const { dispatch, unreadActivityCount } = this.props;
    const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${username}`);

    ws.onmessage = (e) => {
      // a message was received
      dispatch(updateUnreadActivityCount(unreadActivityCount + 1));
    };
  };

  _setPushToken = async (username) => {
    const { notificationSettings } = this.props;
    const token = await AppCenter.getInstallId();

    getExistUser().then((isExistUser) => {
      if (isExistUser) {
        getPushTokenSaved().then((isPushTokenSaved) => {
          if (!isPushTokenSaved) {
            const data = {
              username,
              token,
              system: Platform.OS,
              allows_notify: notificationSettings,
            };
            setPushToken(data).then(() => {
              setPushTokenSaved(true);
            });
          }
        });
      }
    });
  };

  _logout = () => {
    const {
      otherAccounts, currentAccountUsername, dispatch,
    } = this.props;

    removeUserData(currentAccountUsername)
      .then(() => {
        const _otherAccounts = otherAccounts.filter(
          user => user.username !== currentAccountUsername,
        );

        if (_otherAccounts.length > 0) {
          const targetAccountUsername = _otherAccounts[0].username;

          this._switchAccount(targetAccountUsername);
        } else {
          dispatch(updateCurrentAccount({}));
          dispatch(login(false));
        }

        dispatch(removeOtherAccount(currentAccountUsername));
        dispatch(logoutDone());
      })
      .catch((err) => {
        alert('err');
      });
  };

  _switchAccount = (targetAccountUsername) => {
    const { dispatch } = this.props;

    switchAccount(targetAccountUsername).then((accountData) => {
      const realmData = getUserDataWithUsername(targetAccountUsername);
      const _currentAccount = accountData;
      _currentAccount.username = accountData.name;
      _currentAccount.local = realmData[0];

      dispatch(updateCurrentAccount(_currentAccount));
    });
  }

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
  // Application
  isDarkTheme: state.application.isDarkTheme,
  selectedLanguage: state.application.language,
  notificationSettings: state.application.isNotificationOpen,
  isLogingOut: state.application.isLogingOut,
  isLoggedIn: state.application.isLoggedIn,

  // Account
  unreadActivityCount: state.account.currentAccount.unread_activity_count,
  currentAccountUsername: state.account.currentAccount.name,
  otherAccounts: state.account.otherAccounts,
});

export default connect(mapStateToProps)(ApplicationContainer);
