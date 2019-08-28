import { Component } from 'react';
import { Platform, BackHandler, Alert, Linking, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Config from 'react-native-config';
import Push from 'appcenter-push';
import get from 'lodash/get';
import AppCenter from 'appcenter';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { NavigationActions } from 'react-navigation';
import { bindActionCreators } from 'redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import forEach from 'lodash/forEach';

// Constants
import AUTH_TYPE from '../../../constants/authType';
import ROUTES from '../../../constants/routeNames';

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
import { getUser, getPost } from '../../../providers/steem/dsteem';
import { switchAccount } from '../../../providers/steem/auth';
import { setPushToken } from '../../../providers/esteem/esteem';

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
  isPinCodeOpen,
  setPinCode as savePinCode,
} from '../../../redux/actions/applicationActions';
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

import { encryptKey } from '../../../utils/crypto';

import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

// Workaround
let previousAppState = 'background';
export const setPreviousAppState = () => {
  const appStateTimeout = setTimeout(() => {
    previousAppState = AppState.currentState;
    clearTimeout(appStateTimeout);
  }, 2000);
};

class ApplicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRenderRequire: true,
      isReady: false,
      isIos: Platform.OS !== 'android',
      isThemeReady: false,
      appState: AppState.currentState,
    };
  }

  componentWillMount() {
    const { isDarkTheme: _isDarkTheme } = this.props;
    EStyleSheet.build(_isDarkTheme ? darkTheme : lightTheme);
  }

  componentDidMount = () => {
    const { isIos } = this.state;

    this._setNetworkListener();

    if (!isIos) BackHandler.addEventListener('hardwareBackPress', this._onBackPress);

    Linking.addEventListener('url', this._handleOpenURL);

    Linking.getInitialURL().then(url => {
      this._handleDeepLink(url);
    });

    AppState.addEventListener('change', this._handleAppStateChange);
    setPreviousAppState();

    this._createPushListener();
  };

  componentWillReceiveProps(nextProps) {
    const { isDarkTheme: _isDarkTheme, selectedLanguage, isLogingOut, isConnected } = this.props;

    if (_isDarkTheme !== nextProps.isDarkTheme || selectedLanguage !== nextProps.selectedLanguage) {
      this.setState({ isRenderRequire: false }, () => this.setState({ isRenderRequire: true }));
      if (nextProps.isDarkTheme) {
        changeNavigationBarColor('#1e2835');
      } else {
        changeNavigationBarColor('#FFFFFF');
      }
    }

    if (isLogingOut !== nextProps.isLogingOut && nextProps.isLogingOut) {
      this._logout();
    }

    if (isConnected !== null && isConnected !== nextProps.isConnected && nextProps.isConnected) {
      this._fetchApp();
      this.globalInterval = setInterval(this._refreshGlobalProps, 180000);
    }
  }

  componentWillUnmount() {
    const { isIos } = this.state;
    const { isPinCodeOpen: _isPinCodeOpen } = this.props;

    if (!isIos) BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);

    // NetInfo.isConnected.removeEventListener('connectionChange', this._handleConntectionChange);
    clearInterval(this.globalInterval);

    Linking.removeEventListener('url', this._handleOpenURL);

    AppState.removeEventListener('change', this._handleAppStateChange);

    if (_isPinCodeOpen) {
      clearTimeout(this._pinCodeTimer);
    }

    this.netListener();
  }

  _setNetworkListener = () => {
    this.netListener = NetInfo.addEventListener(state => {
      const { isConnected, dispatch } = this.props;
      if (state.isConnected !== isConnected) {
        dispatch(setConnectivityStatus(state.isConnected));
        this._fetchApp();
        if (!state.isConnected) {
          clearInterval(this.globalInterval);
        }
      }
    });
  };

  _handleOpenURL = event => {
    this._handleDeepLink(event.url);
  };

  _handleDeepLink = async url => {
    if (!url) return;

    let author;
    let permlink;
    let routeName;
    let params;
    let content;
    let profile;
    let isHasParentPost = false;
    const { currentAccount, dispatch } = this.props;
    const { isIos } = this.state;

    const mapObj = {
      esteem: '',
      'steemit.com/': '',
      'busy.org/': '',
      'steempeak.com/': '',
    };

    let formattedUrl = url
      .split('//')
      .pop()
      .replace(/steemit.com\/|busy.org\/|steempeak.com\//gi, matched => {
        return mapObj[matched];
      });

    // TODO: WORKAROUND
    if (isIos && url.indexOf('esteem://') > -1) {
      formattedUrl = `@${formattedUrl}`;
    }

    const routeParams = formattedUrl.indexOf('/') > -1 ? formattedUrl.split('/') : [formattedUrl];

    forEach(routeParams, (value, index) => {
      if (value.indexOf('@') > -1) {
        author = value.replace('@', '');
        permlink = routeParams[index + 1];
      }
    });

    if (author && permlink) {
      await getPost(author, permlink, currentAccount.name)
        .then(result => {
          content = result;
          isHasParentPost = get(result, 'parent_permlink');
        })
        .catch(() => {
          this._handleAlert('deep_link.no_existing_post');
        });

      routeName = ROUTES.SCREENS.POST;
      params = { content, isHasParentPost };
    } else if (author) {
      profile = await getUser(author);

      if (!profile) {
        this._handleAlert('deep_link.no_existing_user');
        return;
      }

      routeName = ROUTES.SCREENS.PROFILE;
      params = { username: get(profile, 'name'), reputation: get(profile, 'reputation') };
    }

    if (routeName && (profile || content)) {
      this.navigationTimeout = setTimeout(() => {
        clearTimeout(this.navigationTimeout);
        const navigateAction = NavigationActions.navigate({
          routeName,
          params,
          key: permlink || author,
          action: NavigationActions.navigate({ routeName }),
        });
        dispatch(navigateAction);
      }, 2000);
    }
  };

  _handleAlert = (text = null, title = null) => {
    const { intl } = this.props;

    Alert.alert(
      intl.formatMessage({ id: title || 'alert.warning' }),
      intl.formatMessage({ id: text || 'alert.unknow_error' }),
    );
  };

  _handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    const { isPinCodeOpen: _isPinCodeOpen } = this.props;

    getExistUser().then(isExistUser => {
      if (isExistUser) {
        if (appState.match(/active|forground/) && nextAppState === 'inactive') {
          this._startPinCodeTimer();
        }

        if (appState.match(/inactive|background/) && nextAppState === 'active') {
          if (_isPinCodeOpen) {
            clearTimeout(this._pinCodeTimer);
          }
        }
      }
    });
    setPreviousAppState();
    this.setState({ appState: nextAppState });
  };

  _startPinCodeTimer = () => {
    const { dispatch, isPinCodeOpen: _isPinCodeOpen } = this.props;

    if (_isPinCodeOpen) {
      this._pinCodeTimer = setTimeout(() => {
        dispatch(openPinCodeModal());
      }, 1 * 60 * 1000);
    }
  };

  _fetchApp = async () => {
    await this._refreshGlobalProps();
    await this._getSettings();
    const userRealmObject = await this._getUserDataFromRealm();
    this.setState({ isReady: true });

    const { isConnected } = this.props;
    if (isConnected && userRealmObject) {
      await this._fetchUserDataFromDsteem(userRealmObject);
      this.globalInterval = setInterval(this._refreshGlobalProps, 180000);
    }
  };

  _createPushListener = () => {
    const { dispatch } = this.props;
    let params = null;
    let key = null;
    let routeName = null;

    Push.setListener({
      onPushNotificationReceived(pushNotification) {
        if (previousAppState !== 'active') {
          const push = get(pushNotification, 'customProperties');
          const type = get(push, 'type', '');
          const permlink1 = get(push, 'permlink1', '');
          const permlink2 = get(push, 'permlink2', '');
          const permlink3 = get(push, 'permlink3', '');
          const parentPermlink1 = get(push, 'parent_permlink1', '');
          const parentPermlink2 = get(push, 'parent_permlink2', '');
          const parentPermlink3 = get(push, 'parent_permlink3', '');

          const fullParentPermlink = `${parentPermlink1}${parentPermlink2}${parentPermlink3}`;
          const fullPermlink = `${permlink1}${permlink2}${permlink3}`;

          switch (type) {
            case 'vote':
            case 'unvote':
              params = {
                author: get(push, 'target', ''),
                permlink: fullPermlink,
              };
              key = fullPermlink;
              routeName = ROUTES.SCREENS.POST;
              break;
            case 'mention':
              params = {
                author: get(push, 'source', ''),
                permlink: fullPermlink,
              };
              key = fullPermlink;
              routeName = ROUTES.SCREENS.POST;
              break;

            case 'follow':
            case 'unfollow':
            case 'ignore':
              params = {
                username: get(push, 'source', ''),
              };
              key = get(push, 'source', '');
              routeName = ROUTES.SCREENS.PROFILE;
              break;

            case 'reblog':
              params = {
                author: get(push, 'target', ''),
                permlink: fullPermlink,
              };
              key = fullPermlink;
              routeName = ROUTES.SCREENS.POST;
              break;

            case 'reply':
              params = {
                author: get(push, 'source', ''),
                permlink: fullPermlink,
                isHasParentPost: fullParentPermlink,
              };
              key = fullPermlink;
              routeName = ROUTES.SCREENS.POST;
              break;

            case 'transfer':
              routeName = ROUTES.TABBAR.PROFILE;
              params = { activePage: 2 };
              break;

            default:
              break;
          }

          const navigateAction = NavigationActions.navigate({
            routeName,
            params,
            key,
            action: NavigationActions.navigate({ routeName }),
          });
          dispatch(navigateAction);
        }
      },
    });
  };

  _handleConntectionChange = status => {
    const { dispatch, isConnected } = this.props;

    if (isConnected !== status) {
      dispatch(setConnectivityStatus(status));
    }
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

  _getUserDataFromRealm = async () => {
    const { dispatch, pinCode, isPinCodeOpen: _isPinCodeOpen } = this.props;
    let realmData = [];
    let currentUsername;

    await getAuthStatus().then(res => {
      ({ currentUsername } = res);

      if (res) {
        getUserData().then(async userData => {
          if (userData.length > 0) {
            realmData = userData;
            userData.forEach((accountData, index) => {
              if (
                !accountData.accessToken &&
                !accountData.masterKey &&
                !accountData.postingKey &&
                !accountData.activeKey &&
                !accountData.memoKey
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
        // TODO:
        await switchAccount(realmObject[0].username);
      }
      const isExistUser = await getExistUser();

      realmObject[0].name = currentUsername;
      dispatch(
        updateCurrentAccount({
          name: realmObject[0].username,
          avatar: realmObject[0].avatar,
          authType: realmObject[0].authType,
        }),
      );
      // If in dev mode pin code does not show
      if ((!isExistUser || !pinCode) && _isPinCodeOpen) {
        dispatch(openPinCodeModal());
      } else if (!_isPinCodeOpen) {
        const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
        dispatch(savePinCode(encryptedPin));
      }

      dispatch(activeApplication());
      dispatch(isLoginDone());
      dispatch(login(true));

      return realmObject[0];
    }

    dispatch(updateCurrentAccount({}));
    dispatch(activeApplication());
    dispatch(isLoginDone());

    return null;
  };

  _fetchUserDataFromDsteem = async realmObject => {
    const { dispatch, intl } = this.props;

    await getUser(realmObject.username)
      .then(accountData => {
        accountData.local = realmObject;

        dispatch(updateCurrentAccount(accountData));

        this._connectNotificationServer(accountData.name);
      })
      .catch(err => {
        Alert.alert(
          `${intl.formatMessage({ id: 'alert.fetch_error' })} \n${err.message.substr(0, 20)}`,
        );
      });
  };

  _getSettings = async () => {
    const { dispatch, isConnected } = this.props;

    const settings = await getSettings();

    if (settings) {
      if (settings.isDarkTheme !== '') dispatch(isDarkTheme(settings.isDarkTheme));
      if (settings.isPinCodeOpen !== '') dispatch(isPinCodeOpen(settings.isPinCodeOpen));
      if (settings.language !== '') dispatch(setLanguage(settings.language));
      if (settings.server !== '') dispatch(setApi(settings.server));
      if (settings.upvotePercent !== '') {
        dispatch(setUpvotePercent(Number(settings.upvotePercent)));
      }
      if (settings.isDefaultFooter !== '') dispatch(isDefaultFooter(settings.isDefaultFooter));
      if (settings.notification !== '') {
        dispatch(
          changeNotificationSettings({ type: 'notification', action: settings.notification }),
        );
        dispatch(changeAllNotificationSettings(settings));

        Push.setEnabled(settings.notification);
      }
      if (settings.nsfw !== '') dispatch(setNsfw(settings.nsfw));

      if (isConnected) {
        dispatch(setCurrency(settings.currency !== '' ? settings.currency : 'usd'));
      }

      this.setState({ isThemeReady: true });
    }
  };

  _connectNotificationServer = username => {
    const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${username}`);

    ws.onmessage = () => {
      const { activeBottomTab, unreadActivityCount, dispatch } = this.props;

      dispatch(updateUnreadActivityCount(unreadActivityCount + 1));

      // Workaround
      if (activeBottomTab === ROUTES.TABBAR.NOTIFICATION) {
        dispatch(updateActiveBottomTab(''));
        dispatch(updateActiveBottomTab(ROUTES.TABBAR.NOTIFICATION));
      }
    };
  };

  _logout = () => {
    const {
      otherAccounts,
      currentAccount: { name, local },
      dispatch,
      intl,
    } = this.props;

    removeUserData(name)
      .then(async () => {
        const _otherAccounts = otherAccounts.filter(user => user.username !== name);

        this._enableNotification(name, false);

        if (_otherAccounts.length > 0) {
          const targetAccountUsername = _otherAccounts[0].username;

          await this._switchAccount(targetAccountUsername);
        } else {
          dispatch(updateCurrentAccount({}));
          dispatch(login(false));
          removePinCode();
          setAuthStatus({ isLoggedIn: false });
          setExistUser(false);
          if (local === AUTH_TYPE.STEEM_CONNECT) {
            removeSCAccount(name);
          }
        }

        dispatch(removeOtherAccount(name));
        dispatch(logoutDone());
      })
      .catch(err => {
        Alert.alert(
          `${intl.formatMessage({ id: 'alert.fetch_error' })} \n${err.message.substr(0, 20)}`,
        );
      });
  };

  _enableNotification = async (username, isEnable) => {
    const token = await AppCenter.getInstallId();

    setPushToken({
      username,
      token,
      system: Platform.OS,
      allows_notify: Number(isEnable),
      notify_types: [1, 2, 3, 4, 5, 6],
    });
  };

  _switchAccount = async targetAccountUsername => {
    const { dispatch, isConnected } = this.props;

    if (!isConnected) return;

    const accountData = await switchAccount(targetAccountUsername);

    const realmData = getUserDataWithUsername(targetAccountUsername);
    const _currentAccount = accountData;
    _currentAccount.username = accountData.name;
    [_currentAccount.local] = realmData;

    dispatch(updateCurrentAccount(_currentAccount));
  };

  render() {
    const {
      selectedLanguage,
      isConnected,
      toastNotification,
      isDarkTheme: _isDarkTheme,
      children,
      isPinCodeReqiure,
    } = this.props;
    const { isRenderRequire, isReady, isThemeReady } = this.state;

    return (
      children &&
      children({
        isConnected,
        toastNotification,
        isReady,
        isRenderRequire,
        isThemeReady,
        isPinCodeReqiure,
        isDarkTheme: _isDarkTheme,
        locale: selectedLanguage,
      })
    );
  }
}

export default connect(
  state => ({
    // Application
    isDarkTheme: state.application.isDarkTheme,
    selectedLanguage: state.application.language,
    notificationSettings: state.application.isNotificationOpen,
    isPinCodeOpen: state.application.isPinCodeOpen,
    isLogingOut: state.application.isLogingOut,
    isLoggedIn: state.application.isLoggedIn,
    isConnected: state.application.isConnected,
    nav: state.nav.routes,
    isPinCodeReqiure: state.application.isPinCodeReqiure,
    isActiveApp: state.application.isActive,

    // Account
    unreadActivityCount: state.account.currentAccount.unread_activity_count,
    currentAccount: state.account.currentAccount,
    otherAccounts: state.account.otherAccounts,
    pinCode: state.application.pin,

    // UI
    toastNotification: state.ui.toastNotification,
    activeBottomTab: state.ui.activeBottomTab,
  }),
  dispatch => ({
    dispatch,
    actions: {
      ...bindActionCreators({ fetchGlobalProperties }, dispatch),
    },
  }),
)(injectIntl(ApplicationContainer));
