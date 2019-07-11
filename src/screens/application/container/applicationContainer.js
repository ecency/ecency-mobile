import React, { Component } from 'react';
import Config from 'react-native-config';
import Push from 'appcenter-push';
import get from 'lodash/get';
import AppCenter from 'appcenter';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { Platform, BackHandler, Alert, NetInfo } from 'react-native';
import { connect } from 'react-redux';
import { addLocaleData } from 'react-intl';
import { NavigationActions } from 'react-navigation';
import { bindActionCreators } from 'redux';

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
import { getUser } from '../../../providers/steem/dsteem';
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
} from '../../../redux/actions/applicationActions';

// Container
import ApplicationScreen from '../screen/applicationScreen';
import { Launch } from '../..';

addLocaleData([...en, ...ru, ...de, ...id, ...it, ...hu, ...tr, ...ko, ...pt, ...lt, ...fa]);

class ApplicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRenderRequire: true,
      isReady: false,
      isIos: Platform.OS !== 'android',
      isThemeReady: false,
    };
  }

  componentDidMount = () => {
    const { isIos } = this.state;

    NetInfo.isConnected.fetch().then(_isConnected => {
      if (_isConnected) {
        this._fetchApp();
      } else {
        Alert.alert('No internet connection');
      }
    });

    if (!isIos) BackHandler.addEventListener('hardwareBackPress', this._onBackPress);

    this.globalInterval = setInterval(this._refreshGlobalProps, 180000);
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

  _createPushListener = () => {
    const { dispatch } = this.props;
    let params = null;
    let key = null;
    let routeName = null;

    Push.setListener({
      onPushNotificationReceived(pushNotification) {
        const push = get(pushNotification, 'customProperties');
        const permlink1 = get(push, 'permlink1');
        const permlink2 = get(push, 'permlink2');
        const permlink3 = get(push, 'permlink3');
        const parentPermlink1 = get(push, 'parent_permlink1');
        const parentPermlink2 = get(push, 'parent_permlink2');
        const parentPermlink3 = get(push, 'parent_permlink3');

        if (parentPermlink1 || permlink1) {
          const fullParentPermlink = `${parentPermlink1}${parentPermlink2}${parentPermlink3}`;
          const fullPermlink = `${permlink1}${permlink2}${permlink3}`;

          params = {
            author: parentPermlink1 ? get(push, 'parent_author') : get(push, 'target'),
            permlink: parentPermlink1 ? fullParentPermlink : fullPermlink,
          };
          key = parentPermlink1 ? fullParentPermlink : fullPermlink;
          routeName = ROUTES.SCREENS.POST;
        } else {
          params = {
            username: push.source,
          };
          key = push.source;
          routeName = ROUTES.SCREENS.PROFILE;
        }

        this.pushNavigationTimeout = setTimeout(() => {
          clearTimeout(this.pushNavigationTimeout);
          const navigateAction = NavigationActions.navigate({
            routeName,
            params,
            key,
            action: NavigationActions.navigate({ routeName }),
          });
          dispatch(navigateAction);
        }, 4000);
      },
    });
  };

  _handleConntectionChange = status => {
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
        await switchAccount(realmObject[0].username);
      }

      await getUser(realmObject[0].username)
        .then(accountData => {
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
        .catch(err => {
          Alert.alert(
            `Fetching data from server failed, please try again or notify us at info@esteem.app 
            \n${err.message.substr(0, 20)}`,
          );
        });
    }

    dispatch(activeApplication());
    dispatch(isLoginDone());
  };

  _getSettings = () => {
    const { dispatch } = this.props;

    getSettings().then(response => {
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

  _connectNotificationServer = username => {
    const { dispatch, unreadActivityCount } = this.props;
    const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${username}`);

    ws.onmessage = () => {
      // a message was received
      dispatch(updateUnreadActivityCount(unreadActivityCount + 1));
    };
  };

  _logout = async () => {
    const {
      otherAccounts,
      currentAccount: { name, local },
      dispatch,
    } = this.props;

    await removeUserData(name)
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
          `Fetching data from server failed, please try again or notify us at info@esteem.app 
          \n${err.substr(0, 20)}`,
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
    const { dispatch } = this.props;

    await switchAccount(targetAccountUsername).then(accountData => {
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
