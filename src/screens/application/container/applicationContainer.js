import React, { Component } from 'react';
import {
  Platform, BackHandler, Alert, NetInfo,
} from 'react-native';
import { connect } from 'react-redux';
import { addLocaleData } from 'react-intl';
import Config from 'react-native-config';
import AppCenter from 'appcenter';
import { NavigationActions } from 'react-navigation';

// Constants
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';
import ru from 'react-intl/locale-data/ru';
import AUTH_TYPE from '../../../constants/authType';

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
  removePinCode,
  setAuthStatus,
  removeSCAccount,
  setExistUser,
} from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';
import { setPushToken } from '../../../providers/esteem/esteem';
import { switchAccount } from '../../../providers/steem/auth';

// Actions
import {
  addOtherAccount,
  updateCurrentAccount,
  updateUnreadActivityCount,
  removeOtherAccount,
} from '../../../redux/actions/accountAction';
import {
  activeApplication,
  isDarkTheme,
  isLoginDone,
  isNotificationOpen,
  login,
  logoutDone,
  openPinCodeModal,
  setApi,
  setConnectivityStatus,
  setCurrency,
  setLanguage,
  setUpvotePercent,
} from '../../../redux/actions/applicationActions';

// Container
import ApplicationScreen from '../screen/applicationScreen';
import { Launch } from '../..';

addLocaleData([...en, ...tr, ...ru]);

class ApplicationContainer extends Component {
  constructor() {
    super();
    this.state = {
      isRenderRequire: true,
      isReady: false,
    };
  }

  componentDidMount = async () => {
    let isConnected;

    await NetInfo.isConnected.fetch().then((_isConnected) => {
      isConnected = _isConnected;
    });

    NetInfo.isConnected.addEventListener('change', this._handleConntectionChange);
    BackHandler.addEventListener('hardwareBackPress', this._onBackPress);

    if (isConnected) {
      this._getSettings();
      await this._getUserData();
    } else {
      Alert.alert('No internet connection');
    }
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
    NetInfo.isConnected.removeEventListener('change', this._handleConntectionChange);
  }

  _handleConntectionChange = (status) => {
    const { dispatch, isConnected } = this.props;

    if (isConnected !== status) {
      dispatch(setConnectivityStatus(status));
    }

    // NetInfo.isConnected.removeEventListener('connectionChange', this._handleConntectionChange);
    // NetInfo.isConnected.addEventListener('connectionChange', this._handleConntectionChange);
  };

  _onBackPress = () => {
    const { dispatch, nav } = this.props;

    if (nav && nav[0].index !== 0) {
      dispatch(NavigationActions.back());
    } else {
      BackHandler.exitApp();
    }
    return true;
  };

  _getUserData = async () => {
    const { dispatch, pinCode } = this.props;
    let realmData = [];
    let currentUsername;

    await getAuthStatus().then((res) => {
      ({ currentUsername } = res);
      if (res) {
        getUserData().then(async (userData) => {
          if (userData.length > 0) {
            realmData = userData;
            userData.forEach((accountData, index) => {
              if (
                !accountData.accessToken
                && !accountData.masterKey
                && !accountData.postingKey
                && !accountData.activeKey
                && !accountData.memoKey
              ) {
                realmData.splice(index, 1);
                if (realmData.length === 0) {
                  dispatch(login(false));
                  dispatch(logoutDone());
                  removePinCode();
                  setAuthStatus({ isLoggedIn: false });
                  setExistUser(false);
                  if (accountData.authType === AUTH_TYPE.STEEM_CONNECT) {
                    removeSCAccount(accountData.username);
                  }
                }
                removeUserData(accountData.username);
              } else {
                dispatch(addOtherAccount({ username: accountData.username }));
              }
            });
          }
        });
      }
    });

    if (realmData.length > 0) {
      const realmObject = realmData.filter(data => data.username === currentUsername);

      if (realmObject.length === 0) {
        realmObject[0] = realmData[realmData.length - 1];
        await switchAccount(realmObject[0].username);
      }
      await getUser(realmObject[0].username)
        .then(async (accountData) => {
          dispatch(login(true));

          const isExistUser = await getExistUser();

          [accountData.local] = realmObject;

          dispatch(updateCurrentAccount(accountData));
          // If in dev mode pin code does not show
          if (!isExistUser || !pinCode) {
            dispatch(openPinCodeModal());
          }
          this._connectNotificationServer(accountData.name);
          this._setPushToken(accountData.name);
        })
        .catch((err) => {
          Alert.alert(err);
        });
    }

    dispatch(activeApplication());
    dispatch(isLoginDone());
  };

  _getSettings = () => {
    const { dispatch } = this.props;

    getSettings().then((response) => {
      if (response) {
        if (response.isDarkTheme !== '') dispatch(isDarkTheme(response.isDarkTheme));
        if (response.language !== '') dispatch(setLanguage(response.language));
        if (response.currency !== '') dispatch(setCurrency(response.currency));
        if (response.notification !== '') dispatch(isNotificationOpen(response.notification));
        if (response.server !== '') dispatch(setApi(response.server));
        if (response.upvotePercent !== '') dispatch(setUpvotePercent(Number(response.upvotePercent)));

        this.setState({ isReady: true });
      }
    });
  };

  _connectNotificationServer = (username) => {
    const { dispatch, unreadActivityCount } = this.props;
    const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${username}`);

    ws.onmessage = () => {
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
    const { otherAccounts, currentAccount, dispatch } = this.props;

    removeUserData(currentAccount.name)
      .then(() => {
        const _otherAccounts = otherAccounts.filter(user => user.username !== currentAccount.name);

        if (_otherAccounts.length > 0) {
          const targetAccountUsername = _otherAccounts[0].username;

          this._switchAccount(targetAccountUsername);
        } else {
          dispatch(updateCurrentAccount({}));
          dispatch(login(false));
          removePinCode();
          setAuthStatus({ isLoggedIn: false });
          setExistUser(false);
          if (currentAccount.local === AUTH_TYPE.STEEM_CONNECT) {
            removeSCAccount(currentAccount.name);
          }
        }

        dispatch(removeOtherAccount(currentAccount.name));
        dispatch(logoutDone());
      })
      .catch(() => {});
  };

  _switchAccount = (targetAccountUsername) => {
    const { dispatch } = this.props;

    switchAccount(targetAccountUsername).then((accountData) => {
      const realmData = getUserDataWithUsername(targetAccountUsername);
      const _currentAccount = accountData;
      _currentAccount.username = accountData.name;
      [_currentAccount.local] = realmData;

      dispatch(updateCurrentAccount(_currentAccount));
    });
  };

  render() {
    const { selectedLanguage, isConnected } = this.props;
    const { isRenderRequire, isReady } = this.state;

    // For testing It comented out.
    // const locale = (navigator.languages && navigator.languages[0])
    //   || navigator.language
    //   || navigator.userLanguage
    //   || selectedLanguage;

    if (isRenderRequire && isReady) {
      return (
        <ApplicationScreen isConnected={isConnected} locale={selectedLanguage} {...this.props} />
      );
    }
    return <Launch />;
  }
}

const mapStateToProps = state => ({
  // Application
  isDarkTheme: state.application.isDarkTheme,
  selectedLanguage: state.application.language,
  notificationSettings: state.application.isNotificationOpen,
  isLogingOut: state.application.isLogingOut,
  isLoggedIn: state.application.isLoggedIn,
  isConnected: state.application.isConnected,
  nav: state.nav.routes,

  // Account
  unreadActivityCount: state.account.currentAccount.unread_activity_count,
  currentAccount: state.account.currentAccount,
  otherAccounts: state.account.otherAccounts,
  pinCode: state.account.pin,
});

export default connect(mapStateToProps)(ApplicationContainer);
