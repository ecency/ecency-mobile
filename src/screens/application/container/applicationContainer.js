import React, { Component } from 'react';
import {
  Platform, BackHandler, Alert, NetInfo,
} from 'react-native';
import { connect } from 'react-redux';
import { addLocaleData } from 'react-intl';
import Config from 'react-native-config';
import { NavigationActions } from 'react-navigation';
import { bindActionCreators } from 'redux';
import Push from 'appcenter-push';

// Languages
import en from 'react-intl/locale-data/en';
import id from 'react-intl/locale-data/id';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import it from 'react-intl/locale-data/it';
import hu from 'react-intl/locale-data/hu';
import tr from 'react-intl/locale-data/tr';
import ko from 'react-intl/locale-data/ko';
import lt from 'react-intl/locale-data/lt';
import pt from 'react-intl/locale-data/pt';
import fa from 'react-intl/locale-data/fa';
import he from 'react-intl/locale-data/he';

// Constants
import AUTH_TYPE from '../../../constants/authType';

// Services
import {
  getAuthStatus,
  getExistUser,
  getSettings,
  getUserData,
  removeUserData,
  getUserDataWithUsername,
  removePinCode,
  setAuthStatus,
  removeSCAccount,
  setExistUser,
} from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';
import { switchAccount } from '../../../providers/steem/auth';

// Actions
import {
  addOtherAccount,
  updateCurrentAccount,
  updateUnreadActivityCount,
  removeOtherAccount,
  fetchGlobalProperties,
} from '../../../redux/actions/accountAction';
import {
  activeApplication,
  isDarkTheme,
  isLoginDone,
  changeNotificationSettings,
  changeAllNotificationSettings,
  login,
  logoutDone,
  openPinCodeModal,
  setApi,
  setConnectivityStatus,
  setCurrency,
  setLanguage,
  setUpvotePercent,
  setNsfw,
  isDefaultFooter,
} from '../../../redux/actions/applicationActions';

// Container
import ApplicationScreen from '../screen/applicationScreen';
import { Launch } from '../..';

addLocaleData([...en, ...ru, ...de, ...id, ...it, ...hu, ...tr, ...ko, ...pt, ...lt, ...fa]);

class ApplicationContainer extends Component {
  constructor() {
    super();
    this.state = {
      isRenderRequire: true,
      isReady: false,
      isIos: Platform.OS !== 'android',
      isThemeReady: false,
    };
  }

  componentDidMount = async () => {
    const { isIos } = this.state;
    let isConnected;

    await NetInfo.isConnected.fetch().then((_isConnected) => {
      isConnected = _isConnected;
    });

    // NetInfo.isConnected.addEventListener('connectionChange', this._handleConntectionChange);
    if (!isIos) BackHandler.addEventListener('hardwareBackPress', this._onBackPress);

    if (isConnected) {
      this._fetchApp();
    } else {
      Alert.alert('No internet connection');
    }

    this.globalInterval = setInterval(this._refreshGlobalProps, 180000);
  };

  componentWillReceiveProps(nextProps) {
    const {
      isDarkTheme: _isDarkTheme, selectedLanguage, isLogingOut, isConnected,
    } = this.props;

    if (_isDarkTheme !== nextProps.isDarkTheme || selectedLanguage !== nextProps.selectedLanguage) {
      this.setState({ isRenderRequire: false }, () => this.setState({ isRenderRequire: true }));
    }

    if (isLogingOut !== nextProps.isLogingOut && nextProps.isLogingOut) {
      this._logout();
    }

    if (isConnected !== nextProps.isConnected && nextProps.isConnected) {
      this._fetchApp();
    }
  }

  componentWillUnmount() {
    const { isIos } = this.state;

    if (!isIos) BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);

    // NetInfo.isConnected.removeEventListener('connectionChange', this._handleConntectionChange);
    clearInterval(this.globalInterval);
  }

  _fetchApp = async () => {
    await this._refreshGlobalProps();
    this._getSettings();
    await this._getUserData();
    this.setState({ isReady: true });
  };

  _handleConntectionChange = (status) => {
    const { dispatch, isConnected } = this.props;

    if (isConnected !== status) {
      dispatch(setConnectivityStatus(status));
    }

    // TODO: solve this work arround
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

  _refreshGlobalProps = () => {
    const { actions } = this.props;

    actions.fetchGlobalProperties();
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
        .then((accountData) => {
          dispatch(login(true));

          const isExistUser = getExistUser();

          [accountData.local] = realmObject;

          dispatch(updateCurrentAccount(accountData));
          // If in dev mode pin code does not show
          if (!isExistUser || !pinCode) {
            dispatch(openPinCodeModal());
          }
          this._connectNotificationServer(accountData.name);
        })
        .catch((err) => {
          // Alert.alert(err);
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
        if (response.server !== '') dispatch(setApi(response.server));
        if (response.upvotePercent !== '') {
          dispatch(setUpvotePercent(Number(response.upvotePercent)));
        }
        if (response.isDefaultFooter !== '') dispatch(isDefaultFooter(response.isDefaultFooter));
        if (response.notification !== '') {
          dispatch(
            changeNotificationSettings({ type: 'notification', action: response.notification }),
          );
          dispatch(changeAllNotificationSettings(response));

          Push.setEnabled(response.notification);
        }
        if (response.nsfw !== '') dispatch(setNsfw(response.nsfw));

        dispatch(setCurrency(response.currency !== '' ? response.currency : 'usd'));

        this.setState({ isThemeReady: true });
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

  _logout = async () => {
    const { otherAccounts, currentAccount, dispatch } = this.props;

    await removeUserData(currentAccount.name)
      .then(async () => {
        const _otherAccounts = otherAccounts.filter(user => user.username !== currentAccount.name);

        if (_otherAccounts.length > 0) {
          const targetAccountUsername = _otherAccounts[0].username;

          await this._switchAccount(targetAccountUsername);
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

  _switchAccount = async (targetAccountUsername) => {
    const { dispatch } = this.props;

    await switchAccount(targetAccountUsername).then((accountData) => {
      const realmData = getUserDataWithUsername(targetAccountUsername);
      const _currentAccount = accountData;
      _currentAccount.username = accountData.name;
      [_currentAccount.local] = realmData;

      dispatch(updateCurrentAccount(_currentAccount));
    });
  };

  render() {
    const { selectedLanguage, isConnected, toastNotification } = this.props;
    const { isRenderRequire, isReady, isThemeReady } = this.state;

    // For testing It comented out.
    // const locale = (navigator.languages && navigator.languages[0])
    //   || navigator.language
    //   || navigator.userLanguage
    //   || selectedLanguage;

    if (isRenderRequire && isThemeReady) {
      return (
        <ApplicationScreen
          isConnected={isConnected}
          locale={selectedLanguage}
          toastNotification={toastNotification}
          isReady={isReady}
          {...this.props}
        />
      );
    }
    return <Launch />;
  }
}

export default connect(
  state => ({
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

    // UI
    toastNotification: state.ui.toastNotification,
  }),
  dispatch => ({
    dispatch,
    actions: {
      ...bindActionCreators({ fetchGlobalProperties }, dispatch),
    },
  }),
)(ApplicationContainer);
