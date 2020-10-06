import { Component, useState, useEffect } from 'react';
import { Platform, BackHandler, Alert, Linking, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Config from 'react-native-config';
import get from 'lodash/get';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { NavigationActions } from 'react-navigation';
import { bindActionCreators } from 'redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { isEmpty, some } from 'lodash';
import {
  initialMode as nativeThemeInitialMode,
  eventEmitter as nativeThemeEventEmitter,
} from 'react-native-dark-mode';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import VersionNumber from 'react-native-version-number';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import Matomo from 'react-native-matomo-sdk';
import uniqueId from 'react-native-unique-id';

// Constants
import AUTH_TYPE from '../../../constants/authType';
import ROUTES from '../../../constants/routeNames';
import postUrlParser from '../../../utils/postUrlParser';

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
  getVersionForWelcomeModal,
  setVersionForWelcomeModal,
} from '../../../realm/realm';
import { getUser, getPost } from '../../../providers/steem/dsteem';
import { switchAccount } from '../../../providers/steem/auth';
import { setPushToken, markActivityAsRead } from '../../../providers/esteem/esteem';
import { navigate } from '../../../navigation/service';

// Actions
import {
  addOtherAccount,
  updateCurrentAccount,
  updateUnreadActivityCount,
  removeOtherAccount,
  fetchGlobalProperties,
  removeAllOtherAccount,
} from '../../../redux/actions/accountAction';
import {
  activeApplication,
  isDarkTheme,
  changeNotificationSettings,
  changeAllNotificationSettings,
  login,
  logoutDone,
  openPinCodeModal,
  setApi,
  setConnectivityStatus,
  setAnalyticsStatus,
  setCurrency,
  setLanguage,
  setUpvotePercent,
  setNsfw,
  isDefaultFooter,
  isPinCodeOpen,
  setPinCode as savePinCode,
  isRenderRequired,
} from '../../../redux/actions/applicationActions';
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

import { encryptKey } from '../../../utils/crypto';

import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

// Workaround
let previousAppState = 'background';
export const setPreviousAppState = () => {
  previousAppState = AppState.currentState;
  const appStateTimeout = setTimeout(() => {
    previousAppState = AppState.currentState;
    clearTimeout(appStateTimeout);
  }, 500);
};

let firebaseOnNotificationOpenedAppListener = null;
let firebaseOnMessageListener = null;
let scAccounts = [];

const ApplicationContainer = ({
  dispatch,
  isAnalytics,
  isGlobalRenderRequired,
  isPinCodeOpen: _isPinCodeOpen,
  isDarkTheme: _isDarkTheme,
  isConnected,
  isLogingOut,
  isPinCodeRequire,
  pinCode,
  toastNotification,
  selectedLanguage,
  children,
  rcOffer,
  api,
  intl,
  nav,
  actions,
  currentAccount,
  otherAccounts,
  activeBottomTab,
  unreadActivityCount,
}) => {
  const [isRenderRequire, setIsRenderRequire] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isIos, setIsIos] = useState(Platform.OS !== 'android');
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  let _pinCodeTimer = null;
  const { appVersion } = VersionNumber;

  useEffect(() => {
    const { appVersion } = VersionNumber;
    _setNetworkListener();

    Linking.addEventListener('url', _handleOpenURL);

    Linking.getInitialURL().then((url) => {
      _handleDeepLink(url);
    });

    AppState.addEventListener('change', _handleAppStateChange);
    setPreviousAppState();

    if (nativeThemeEventEmitter) {
      nativeThemeEventEmitter.on('currentModeChanged', (newMode) => {
        dispatch(isDarkTheme(newMode === 'dark'));
      });
    }
    _createPushListener();

    if (!isIos) BackHandler.addEventListener('hardwareBackPress', _onBackPress);

    getVersionForWelcomeModal().then((version) => {
      if (version < parseFloat(appVersion)) {
        getUserData().then((accounts) => {
          setShowWelcomeModal(true);
          if (accounts && accounts.length > 0) {
            accounts.forEach((account) => {
              if (get(account, 'authType', '') === AUTH_TYPE.STEEM_CONNECT) {
                scAccounts.push(account);
              }
            });
          }
        });
      }
    });

    ReceiveSharingIntent.getReceivedFiles(
      (files) => {
        navigate({
          routeName: ROUTES.SCREENS.EDITOR,
          params: { upload: files },
        });
        // files returns as JSON Array example
        //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
      },
      (error) => {
        console.log('error :>> ', error);
      },
    );

    // tracking init
    Matomo.initialize(Config.ANALYTICS_URL, 1, 'https://ecency.com')
      .catch((error) => console.warn('Failed to initialize matomo', error))
      .then(() => {
        if (isAnalytics !== true) {
          dispatch(setAnalyticsStatus(true));
        }
      })
      .then(() => {
        uniqueId()
          .then(async (id) => {
            await Matomo.setUserId(id).catch((error) =>
              console.warn('Error setting user id', error),
            );
          })
          .catch((error) => console.error(error));
      })
      .then(() => {
        // start up event
        Matomo.trackEvent('Application', 'Startup').catch((error) =>
          console.warn('Failed to track event', error),
        );
      });
  }, []);

  useEffect(() => {
    if (isGlobalRenderRequired) {
      setIsRenderRequire(true);
      dispatch(isRenderRequired(false));
    }
  }, [isGlobalRenderRequired]);

  useEffect(() => {
    if (!isIos) BackHandler.removeEventListener('hardwareBackPress', _onBackPress);
    Linking.removeEventListener('url', _handleOpenURL);

    AppState.removeEventListener('change', _handleAppStateChange);

    if (_isPinCodeOpen) {
      clearTimeout(_pinCodeTimer);
    }

    if (firebaseOnMessageListener) {
      firebaseOnMessageListener();
    }

    if (firebaseOnNotificationOpenedAppListener) {
      firebaseOnNotificationOpenedAppListener();
    }

    netListener();

    return () => {
      console.log('componentWillUnmount');
    };
  }, [isIos, _isPinCodeOpen]);

  useEffect(() => {
    if (_isDarkTheme || selectedLanguage || api) {
      setIsRenderRequire(true);
    }

    if (_isDarkTheme) {
      changeNavigationBarColor('#1e2835');
    } else {
      changeNavigationBarColor('#FFFFFF', true);
    }

    if (isLogingOut) {
      _logout();
    }

    if (isConnected !== null && isConnected) {
      _fetchApp();
    }
    return () => {
      EStyleSheet.build(_isDarkTheme ? darkTheme : lightTheme);
    };
  }, [_isDarkTheme, selectedLanguage, isLogingOut, isConnected, api]);

  const _setNetworkListener = () => {
    netListener = NetInfo.addEventListener((state) => {
      if (state.isConnected !== isConnected) {
        dispatch(setConnectivityStatus(state.isConnected));
        _fetchApp();
      }
    });
  };

  const _handleOpenURL = (event) => {
    _handleDeepLink(event.url);
  };

  const _handleDeepLink = async (url = '') => {
    if (!url || url.indexOf('ShareMedia://') >= 0) return;

    let routeName;
    let params;
    let content;
    let profile;

    const postUrl = postUrlParser(url);
    const { author, permlink } = postUrl;

    try {
      if (author) {
        if (permlink) {
          content = await getPost(author, permlink, currentAccount.name);
          routeName = ROUTES.SCREENS.POST;
          params = {
            content,
          };
        } else {
          profile = await getUser(author);
          routeName = ROUTES.SCREENS.PROFILE;
          params = {
            username: get(profile, 'name'),
            reputation: get(profile, 'reputation'),
          };
        }
      }
    } catch (error) {
      _handleAlert('deep_link.no_existing_user');
    }

    if (routeName && (profile || content)) {
      navigate({
        routeName,
        params,
        key: permlink || author,
      });
    }
  };

  const _handleAlert = (text = null, title = null) => {
    Alert.alert(
      intl.formatMessage({
        id: title || 'alert.warning',
      }),
      intl.formatMessage({
        id: text || 'alert.unknow_error',
      }),
    );
  };

  const _handleAppStateChange = (nextAppState) => {
    getExistUser().then((isExistUser) => {
      if (isExistUser) {
        if (appState.match(/active|forground/) && nextAppState === 'inactive') {
          _startPinCodeTimer();
        }

        if (appState.match(/inactive|background/) && nextAppState === 'active') {
          if (_isPinCodeOpen) {
            clearTimeout(_pinCodeTimer);
          }
        }
      }
    });
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      _refreshGlobalProps();
    }
    setPreviousAppState();
    setAppState(nextAppState);
  };

  const _startPinCodeTimer = () => {
    if (_isPinCodeOpen) {
      _pinCodeTimer = setTimeout(() => {
        dispatch(openPinCodeModal());
      }, 1 * 60 * 1000);
    }
  };

  const _fetchApp = async () => {
    await _getSettings();
    setIsReady(true);
    _refreshGlobalProps();
    _getUserDataFromRealm();
  };

  const _pushNavigate = (notification) => {
    let params = null;
    let key = null;
    let routeName = null;

    if (previousAppState !== 'active' && !!notification) {
      const push = get(notification, 'data');
      const type = get(push, 'type', '');
      const fullPermlink =
        get(push, 'permlink1', '') + get(push, 'permlink2', '') + get(push, 'permlink3', '');
      const username = get(push, 'target', '');
      const activity_id = get(push, 'id', '');

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
          };
          key = fullPermlink;
          routeName = ROUTES.SCREENS.POST;
          break;

        case 'transfer':
          routeName = ROUTES.TABBAR.PROFILE;
          params = {
            activePage: 2,
          };
          break;

        default:
          break;
      }

      markActivityAsRead(username, activity_id).then((result) => {
        dispatch(updateUnreadActivityCount(result.unread));
      });
      if (!some(params, isEmpty)) {
        navigate({
          routeName,
          params,
          key,
        });
      }
    }
  };

  const _createPushListener = () => {
    (async () => await messaging().requestPermission())();

    PushNotification.setApplicationIconBadgeNumber(0);
    PushNotification.cancelAllLocalNotifications();

    firebaseOnMessageListener = messaging().onMessage((remoteMessage) => {
      _pushNavigate(remoteMessage);
    });

    firebaseOnNotificationOpenedAppListener = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        _pushNavigate(remoteMessage);
      },
    );

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        _pushNavigate(remoteMessage);
      });
  };

  const _handleConntectionChange = (status) => {
    if (isConnected !== status) {
      dispatch(setConnectivityStatus(status));
    }
  };

  const _onBackPress = () => {
    if (nav && nav[0].index !== 0) {
      dispatch(NavigationActions.back());
    } else {
      BackHandler.exitApp();
    }

    return true;
  };

  const _refreshGlobalProps = () => {
    actions.fetchGlobalProperties();
  };

  const _getUserDataFromRealm = async () => {
    let realmData = [];

    const res = await getAuthStatus();
    const { currentUsername } = res;

    if (res) {
      dispatch(activeApplication());
      dispatch(login(true));
      const userData = await getUserData();

      if (userData && userData.length > 0) {
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
              setAuthStatus({
                isLoggedIn: false,
              });
              setExistUser(false);
              if (accountData.authType === AUTH_TYPE.STEEM_CONNECT) {
                removeSCAccount(accountData.username);
              }
            }
            removeUserData(accountData.username);
          } else {
            dispatch(
              addOtherAccount({
                username: accountData.username,
              }),
            );
            // TODO: check post v2.2.5+ or remove setexistuser from login
            setExistUser(true);
          }
        });
      }
    }

    if (realmData.length > 0) {
      const realmObject = realmData.filter((data) => data.username === currentUsername);

      if (realmObject.length === 0) {
        realmObject[0] = realmData[realmData.length - 1];
        // TODO:
        await switchAccount(realmObject[0].username);
      }
      const isExistUser = await getExistUser();

      realmObject[0].name = currentUsername;
      // If in dev mode pin code does not show
      if ((!isExistUser || !pinCode) && _isPinCodeOpen) {
        dispatch(openPinCodeModal());
      } else if (!_isPinCodeOpen) {
        const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
        dispatch(savePinCode(encryptedPin));
      }

      if (isConnected) {
        _fetchUserDataFromDsteem(realmObject[0]);
      }

      return realmObject[0];
    }

    dispatch(updateCurrentAccount({}));
    dispatch(activeApplication());

    return null;
  };

  const _fetchUserDataFromDsteem = async (realmObject) => {
    await getUser(realmObject.username)
      .then((accountData) => {
        accountData.local = realmObject;

        dispatch(updateCurrentAccount(accountData));

        _connectNotificationServer(accountData.name);
      })
      .catch((err) => {
        Alert.alert(
          `${intl.formatMessage({ id: 'alert.fetch_error' })} \n${err.message.substr(0, 20)}`,
        );
      });
  };

  const _getSettings = async () => {
    const settings = await getSettings();

    if (settings) {
      dispatch(
        isDarkTheme(
          settings.isDarkTheme === null ? nativeThemeInitialMode === 'dark' : settings.isDarkTheme,
        ),
      );
      setIsThemeReady(true);
      if (settings.isPinCodeOpen !== '') await dispatch(isPinCodeOpen(settings.isPinCodeOpen));
      if (settings.language !== '') dispatch(setLanguage(settings.language));
      if (settings.server !== '') dispatch(setApi(settings.server));
      if (settings.upvotePercent !== '') {
        dispatch(setUpvotePercent(Number(settings.upvotePercent)));
      }
      if (settings.isDefaultFooter !== '') dispatch(isDefaultFooter(settings.isDefaultFooter));
      if (settings.notification !== '') {
        dispatch(
          changeNotificationSettings({
            type: 'notification',
            action: settings.notification,
          }),
        );
        dispatch(changeAllNotificationSettings(settings));
      }
      if (settings.nsfw !== '') dispatch(setNsfw(settings.nsfw));

      if (settings.currency !== '') {
        dispatch(setCurrency(settings.currency !== '' ? settings.currency : 'usd'));
      }
    }
  };

  const _connectNotificationServer = (username) => {
    /* eslint no-undef: "warn" */
    const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${username}`);

    ws.onmessage = () => {
      dispatch(updateUnreadActivityCount(unreadActivityCount + 1));

      // Workaround
      if (activeBottomTab === ROUTES.TABBAR.NOTIFICATION) {
        dispatch(updateActiveBottomTab(''));
        dispatch(updateActiveBottomTab(ROUTES.TABBAR.NOTIFICATION));
      }
    };
  };

  const _logout = () => {
    const { name, local } = currentAccount;

    removeUserData(name)
      .then(async () => {
        const _otherAccounts = otherAccounts.filter((user) => user.username !== name);
        _enableNotification(name, false);

        if (_otherAccounts.length > 0 && _otherAccounts[0].username) {
          const targetAccountUsername = _otherAccounts[0].username;

          await _switchAccount(targetAccountUsername);
        } else {
          dispatch(updateCurrentAccount({}));
          dispatch(login(false));
          removePinCode();
          setAuthStatus({
            isLoggedIn: false,
          });
          setExistUser(false);
          if (local === AUTH_TYPE.STEEM_CONNECT) {
            removeSCAccount(name);
          }
        }

        dispatch(removeOtherAccount(name));
        dispatch(logoutDone());
      })
      .catch((err) => {
        Alert.alert(
          `${intl.formatMessage({ id: 'alert.fetch_error' })} \n${err.message.substr(0, 20)}`,
        );
      });
  };

  const _enableNotification = async (username, isEnable) => {
    messaging()
      .getToken()
      .then((token) => {
        setPushToken({
          username,
          token,
          system: `fcm-${Platform.OS}`,
          allows_notify: Number(isEnable),
          notify_types: [1, 2, 3, 4, 5, 6],
        });
      });
  };

  const _switchAccount = async (targetAccountUsername) => {
    if (!isConnected) return;

    const accountData = await switchAccount(targetAccountUsername);

    const realmData = await getUserDataWithUsername(targetAccountUsername);
    const _currentAccount = accountData;
    _currentAccount.username = accountData.name;
    [_currentAccount.local] = realmData;

    dispatch(updateCurrentAccount(_currentAccount));
  };

  const _handleWelcomeModalButtonPress = () => {
    setVersionForWelcomeModal(appVersion);
    setShowWelcomeModal(false);
  };

  return (
    children &&
    children({
      isConnected,
      isDarkTheme: _isDarkTheme,
      isPinCodeRequire,
      isReady,
      isRenderRequire,
      isThemeReady,
      locale: selectedLanguage,
      rcOffer,
      toastNotification,
      showWelcomeModal,
      handleWelcomeModalButtonPress: _handleWelcomeModalButtonPress,
    })
  );
};

export default connect(
  (state) => ({
    // Application
    isDarkTheme: state.application.isDarkTheme,
    selectedLanguage: state.application.language,
    notificationSettings: state.application.isNotificationOpen,
    isPinCodeOpen: state.application.isPinCodeOpen,
    isLogingOut: state.application.isLogingOut,
    isLoggedIn: state.application.isLoggedIn,
    isConnected: state.application.isConnected,
    nav: state.nav.routes,
    isPinCodeRequire: state.application.isPinCodeRequire,
    isActiveApp: state.application.isActive,
    api: state.application.api,
    isGlobalRenderRequired: state.application.isRenderRequired,
    isAnalytics: state.application.isAnalytics,

    // Account
    unreadActivityCount: state.account.currentAccount.unread_activity_count,
    currentAccount: state.account.currentAccount,
    otherAccounts: state.account.otherAccounts,
    pinCode: state.application.pin,

    // UI
    toastNotification: state.ui.toastNotification,
    activeBottomTab: state.ui.activeBottomTab,
    rcOffer: state.ui.rcOffer,
  }),
  (dispatch) => ({
    dispatch,
    actions: {
      ...bindActionCreators(
        {
          fetchGlobalProperties,
        },
        dispatch,
      ),
    },
  }),
)(injectIntl(ApplicationContainer));
