import { Component } from 'react';
import { Platform, Alert, Linking, AppState, Appearance } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Config from 'react-native-config';
import get from 'lodash/get';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { isEmpty, some } from 'lodash';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import VersionNumber from 'react-native-version-number';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import SplashScreen from 'react-native-splash-screen'

// Constants
import AUTH_TYPE from '../../../constants/authType';
import ROUTES from '../../../constants/routeNames';
import postUrlParser from '../../../utils/postUrlParser';

// Services
import {
  getAuthStatus,
  getUserData,
  removeUserData,
  getUserDataWithUsername,
  removePinCode,
  setAuthStatus,
  removeSCAccount,
  setExistUser,
  getLastUpdateCheck,
  setLastUpdateCheck,
  getTheme,
} from '../../../realm/realm';
import { getUser, getPost, getDigitPinCode, getMutes } from '../../../providers/hive/dhive';
import { getPointsSummary } from '../../../providers/ecency/ePoint';
import {
  migrateToMasterKeyWithAccessToken,
  refreshSCToken,
  switchAccount,
} from '../../../providers/hive/auth';
import {
  setPushToken,
  markNotifications,
  getUnreadNotificationCount,
} from '../../../providers/ecency/ecency';
import { fetchLatestAppVersion } from '../../../providers/github/github';
import { navigate } from '../../../navigation/service';

// Actions
import {
  addOtherAccount,
  updateCurrentAccount,
  updateUnreadActivityCount,
  removeOtherAccount,
  fetchGlobalProperties,
} from '../../../redux/actions/accountAction';
import {
  isDarkTheme,
  login,
  logoutDone,
  setConnectivityStatus,
  setAnalyticsStatus,
  setPinCode as savePinCode,
  isRenderRequired,
  logout,
  isPinCodeOpen,
  setEncryptedUnlockPin,
} from '../../../redux/actions/applicationActions';
import {
  setAvatarCacheStamp,
  showActionModal,
  toastNotification,
  updateActiveBottomTab,
} from '../../../redux/actions/uiAction';
import { setFeedPosts, setInitPosts } from '../../../redux/actions/postsAction';
import { fetchCoinQuotes } from '../../../redux/actions/walletActions';

import { decryptKey, encryptKey } from '../../../utils/crypto';

import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';
import persistAccountGenerator from '../../../utils/persistAccountGenerator';
import parseVersionNumber from '../../../utils/parseVersionNumber';
import { setMomentLocale } from '../../../utils/time';
import parseAuthUrl from '../../../utils/parseAuthUrl';
import { purgeExpiredCache } from '../../../redux/actions/cacheActions';
import { fetchSubscribedCommunities } from '../../../redux/actions/communitiesAction';
import MigrationHelpers from '../../../utils/migrationHelpers';
import { deepLinkParser } from '../../../utils/deepLinkParser';

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
let removeAppearanceListener = null;

class ApplicationContainer extends Component {

  _pinCodeTimer:any = null

  constructor(props) {
    super(props);
    this.state = {
      isRenderRequire: true,
      isIos: Platform.OS !== 'android',
      appState: AppState.currentState,
      foregroundNotificationData: null,
    };
  }

  componentDidMount = () => {
  
    const { dispatch, isAnalytics } = this.props;

    this._setNetworkListener();

    Linking.addEventListener('url', this._handleOpenURL);
    Linking.getInitialURL().then((url) => {
      this._handleDeepLink(url);
    });

    AppState.addEventListener('change', this._handleAppStateChange);
    setPreviousAppState();

    this.removeAppearanceListener = Appearance.addChangeListener(this._appearanceChangeListener);

    this._createPushListener();

    //set avatar cache stamp to invalidate previous session avatars
    dispatch(setAvatarCacheStamp(new Date().getTime()));

    SplashScreen.hide();
    setMomentLocale();
    this._fetchApp();

    ReceiveSharingIntent.getReceivedFiles(
      files => {
        navigate({
          routeName: ROUTES.SCREENS.EDITOR,
          params: { hasSharedIntent: true, files },
        });
        // files returns as JSON Array example
        //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
        ReceiveSharingIntent.clearReceivedFiles();  // clear Intents
      },
      (error) => {
        console.log('error :>> ', error);
      },
    );

  };

  componentDidUpdate(prevProps, prevState) {
    const { isGlobalRenderRequired, dispatch } = this.props;

    if (isGlobalRenderRequired !== prevProps.isGlobalRenderRequired && isGlobalRenderRequired) {
      this.setState(
        {
          isRenderRequire: false,
        },
        () =>
          this.setState({
            isRenderRequire: true,
          }),
      );
      dispatch(isRenderRequired(false));
    }
  }

  componentWillUnmount() {

    const { isPinCodeOpen: _isPinCodeOpen } = this.props;

    //TOOD: listen for back press and cancel all pending api requests;

    Linking.removeEventListener('url', this._handleOpenURL);

    AppState.removeEventListener('change', this._handleAppStateChange);

    if (_isPinCodeOpen) {
      clearTimeout(this._pinCodeTimer);
    }

    if (firebaseOnMessageListener) {
      firebaseOnMessageListener();
    }

    if (firebaseOnNotificationOpenedAppListener) {
      firebaseOnNotificationOpenedAppListener();
    }

    if (removeAppearanceListener) {
      removeAppearanceListener();
    }

    this.netListener();
  }

  _setNetworkListener = () => {
    this.netListener = NetInfo.addEventListener((state) => {
      const { isConnected, dispatch } = this.props;
      if (state.isConnected !== isConnected) {
        dispatch(setConnectivityStatus(state.isConnected));
        this._fetchApp();
      }
    });
  };

  //change app theme on the fly
  _appearanceChangeListener = () => {
    const { dispatch } = this.props;

    //workaround for bug with Appearece package: https://github.com/facebook/react-native/issues/28525#issuecomment-841812810
    const colorScheme = Appearance.getColorScheme();
    getTheme().then((darkThemeSetting) => {
      if (darkThemeSetting === null) {
        dispatch(isDarkTheme(colorScheme === 'dark'));
      }
    });
  };

  _handleOpenURL = (event) => {
    this._handleDeepLink(event.url);
  };

  _handleDeepLink = async (url = '') => {
    const { currentAccount, intl } = this.props;

    if(!url){
      return;
    }


    try{
      const deepLinkData = await deepLinkParser(url, currentAccount);
      const { routeName, params, key } = deepLinkData || {};
      
      if (routeName && key) {
        navigate({
          routeName,
          params,
          key: key,
        });
      } else {
        throw new Error(intl.formatMessage({id:'deep_link.invalid_link'}))
      }
    } catch(err){
      this._handleAlert(err.message)
    }
    
  };

  _compareAndPromptForUpdate = async () => {
    const recheckInterval = 48 * 3600 * 1000; //2 days
    const { dispatch, intl } = this.props;

    const lastUpdateCheck = await getLastUpdateCheck();

    if (lastUpdateCheck) {
      const timeDiff = new Date().getTime() - lastUpdateCheck;
      if (timeDiff < recheckInterval) {
        return;
      }
    }

    const remoteVersion = await fetchLatestAppVersion();

    if (parseVersionNumber(remoteVersion) > parseVersionNumber(VersionNumber.appVersion)) {
      dispatch(
        showActionModal({
          title: intl.formatMessage(
            { id: 'alert.update_available_title' },
            { version: remoteVersion },
          ),
          body: intl.formatMessage({ id: 'alert.update_available_body' }),
          buttons: [
            {
              text: intl.formatMessage({ id: 'alert.remind_later' }),
              onPress: () => {
                setLastUpdateCheck(new Date().getTime());
              },
            },
            {
              text: intl.formatMessage({ id: 'alert.update' }),
              onPress: () => {
                setLastUpdateCheck(null);
                Linking.openURL(
                  Platform.select({
                    ios: 'itms-apps://itunes.apple.com/us/app/apple-store/id1451896376?mt=8',
                    android: 'market://details?id=app.esteem.mobile.android',
                  }),
                );
              },
            },
          ],
          headerImage: require('../../../assets/phone-holding.png'),
        }),
      );
    }
  };

  _handleAlert = (text = null, title = null) => {
    const { intl } = this.props;

    Alert.alert(
      intl.formatMessage({
        id: title || 'alert.warning',
      }),
      intl.formatMessage({
        id: text || 'alert.unknow_error',
      }),
    );
  };


  _handleAppStateChange = (nextAppState) => {
    const { isPinCodeOpen:_isPinCodeOpen } = this.props;
    const { appState } = this.state;

    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this._refreshGlobalProps();
      if (_isPinCodeOpen && this._pinCodeTimer) {
        clearTimeout(this._pinCodeTimer);
    }
    }

    if (appState.match(/active|forground/) && nextAppState === 'inactive') {
      this._startPinCodeTimer();
    }
    setPreviousAppState();
    this.setState({
      appState: nextAppState,
    });
  };



  _fetchApp = async () => {
    const {dispatch, settingsMigratedV2} = this.props;

    await MigrationHelpers.migrateSettings(dispatch, settingsMigratedV2)

    this._refreshGlobalProps();
    await this._getUserDataFromRealm();
    this._compareAndPromptForUpdate();
    this._registerDeviceForNotifications();
    dispatch(purgeExpiredCache());
  };

  _startPinCodeTimer = () => {
    const {isPinCodeOpen:_isPinCodeOpen} = this.props;
    if (_isPinCodeOpen) {
        this._pinCodeTimer = setTimeout(() => {
            navigate({
              routeName:ROUTES.SCREENS.PINCODE
            })
        }, 1 * 60 * 1000);
    }
};

  _pushNavigate = (notification) => {
    const { dispatch } = this.props;
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

        case 'inactive':
          routeName = ROUTES.SCREENS.EDITOR;
          key = push.source || 'inactive';
          break;

        default:
          break;
      }

      markNotifications(activity_id).then((result) => {
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

  _showNotificationToast = (remoteMessage) => {
    const { dispatch } = this.props;

    if (remoteMessage && remoteMessage.notification) {
      const { title } = remoteMessage.notification;
      dispatch(toastNotification(title));
    }
  };

  _createPushListener = () => {
    (async () => await messaging().requestPermission())();

    PushNotification.setApplicationIconBadgeNumber(0);
    PushNotification.cancelAllLocalNotifications();

    firebaseOnMessageListener = messaging().onMessage((remoteMessage) => {
      console.log('Notification Received: foreground', remoteMessage);
      // this._showNotificationToast(remoteMessage);
      this.setState({
        foregroundNotificationData: remoteMessage,
      });
      this._pushNavigate(remoteMessage);
    });

    firebaseOnNotificationOpenedAppListener = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log('Notification Received, notification oped app:', remoteMessage);
        this._pushNavigate(remoteMessage);
      },
    );

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        this._pushNavigate(remoteMessage);
      });
  };

  _handleConntectionChange = (status) => {
    const { dispatch, isConnected } = this.props;

    if (isConnected !== status) {
      dispatch(setConnectivityStatus(status));
    }
  };


  _refreshGlobalProps = () => {
    const { actions } = this.props;
    actions.fetchGlobalProperties();
    actions.fetchCoinQuotes();
  };

  _getUserDataFromRealm = async () => {
    const { dispatch, pinCode, isPinCodeOpen: _isPinCodeOpen, isConnected } = this.props;
    let realmData = [];

    const res = await getAuthStatus();
    const { currentUsername } = res;

    if (res) {
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
            const persistAccountData = persistAccountGenerator(accountData);
            dispatch(addOtherAccount({ ...persistAccountData }));
            // TODO: check post v2.2.5+ or remove setexistuser from login
            setExistUser(true);
          }
        });
      } else {
        dispatch(login(false));
        dispatch(logoutDone());
      }
    }

    if (realmData.length > 0) {
      const realmObject = realmData.filter((data) => data.username === currentUsername);

      if (realmObject.length === 0) {
        realmObject[0] = realmData[realmData.length - 1];
        // TODO:
        await switchAccount(realmObject[0].username);
      }


      realmObject[0].name = currentUsername;
      // If in dev mode pin code does not show
      if (_isPinCodeOpen) {
        navigate({routeName:ROUTES.SCREENS.PINCODE})
      } else if (!_isPinCodeOpen) {
        const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
        dispatch(savePinCode(encryptedPin));
      }

      if (isConnected) {
        this._fetchUserDataFromDsteem(realmObject[0]);
      
      }

      return realmObject[0];
    }

    dispatch(updateCurrentAccount({}));

    return null;
  };

  _refreshAccessToken = async (currentAccount) => {
    const { pinCode, isPinCodeOpen, encUnlockPin, dispatch, intl } = this.props;

    if (isPinCodeOpen && !encUnlockPin) {
      return currentAccount;
    }

    try {
      const userData = currentAccount.local;
      const encryptedAccessToken = await refreshSCToken(userData, getDigitPinCode(pinCode));

      return {
        ...currentAccount,
        local: {
          ...userData,
          accessToken: encryptedAccessToken,
        },
      };
    } catch (error) {
      console.warn('Failed to refresh access token', error);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message,
        [
          {
            text: intl.formatMessage({ id: 'side_menu.logout' }),
            onPress: () => dispatch(logout()),
          },
          { text: intl.formatMessage({ id: 'alert.cancel' }), style: 'destructive' },
        ],
      );
      return currentAccount;
    }
  };

  _fetchUserDataFromDsteem = async (realmObject) => {
    const { dispatch, intl, pinCode, isPinCodeOpen, encUnlockPin } = this.props;

    try {
      let accountData = await getUser(realmObject.username);
      accountData.local = realmObject;

      //cannot migrate or refresh token since pin would null while pin code modal is open
      if (!isPinCodeOpen || encUnlockPin) {
        //migration script for previously mast key based logged in user not having access token
        if (realmObject.authType !== AUTH_TYPE.STEEM_CONNECT && realmObject.accessToken === '') {
          accountData = await migrateToMasterKeyWithAccessToken(accountData, realmObject, pinCode);
        }

        //refresh access token
        accountData = await this._refreshAccessToken(accountData);
      }

      try {
        accountData.unread_activity_count = await getUnreadNotificationCount();
        accountData.mutes = await getMutes(realmObject.username);
        accountData.pointsSummary = await getPointsSummary(realmObject.username);
      } catch (err) {
        console.warn(
          'Optional user data fetch failed, account can still function without them',
          err,
        );
      }
      dispatch(updateCurrentAccount(accountData));
      dispatch(fetchSubscribedCommunities(realmObject.username));
      this._connectNotificationServer(accountData.name);
      //TODO: better update device push token here after access token refresh
    } catch (err) {
      Alert.alert(
        `${intl.formatMessage({ id: 'alert.fetch_error' })} \n${err.message.substr(0, 20)}`,
      );
    }
  };



  //update notification settings and update push token for each signed accoutn useing access tokens
  _registerDeviceForNotifications = (settings?:any) => {
    const { otherAccounts, notificationDetails, isNotificationsEnabled } = this.props;
    
    const isEnabled = settings ? !!settings.notification : isNotificationsEnabled;
    settings = settings || notificationDetails;


    //updateing fcm token with settings;
    otherAccounts.forEach((account) => {
      //since there can be more than one accounts, process access tokens separate
      const encAccessToken = account?.local?.accessToken;
      //decrypt access token
      let accessToken = null;
      if (encAccessToken) {
        //NOTE: default pin decryption works also for custom pin as other account
        //keys are not yet being affected by changed pin, which I think we should dig more
        accessToken = decryptKey(encAccessToken, Config.DEFAULT_PIN);
      }

      this._enableNotification(account.name, isEnabled, settings, accessToken);
    });
  };



  _connectNotificationServer = (username) => {
    /* eslint no-undef: "warn" */
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
        const _otherAccounts = otherAccounts.filter((user) => user.username !== name);

        this._enableNotification(name, false);

        if (_otherAccounts.length > 0) {
          const targetAccount = _otherAccounts[0];

          await this._switchAccount(targetAccount);
        } else {
          dispatch(updateCurrentAccount({}));
          dispatch(login(false));
          removePinCode();
          setAuthStatus({
            isLoggedIn: false,
          });
          setExistUser(false);
          dispatch(isPinCodeOpen(false));
          dispatch(setEncryptedUnlockPin(encryptKey(Config.DEFAULT_KEU, Config.PIN_KEY)))
          if (local.authType === AUTH_TYPE.STEEM_CONNECT) {
            removeSCAccount(name);
          }
        }

        dispatch(setFeedPosts([]));
        dispatch(setInitPosts([]));
        dispatch(removeOtherAccount(name));
        dispatch(logoutDone());
      })
      .catch((err) => {
        Alert.alert(
          `${intl.formatMessage({ id: 'alert.fetch_error' })} \n${err.message.substr(0, 20)}`,
        );
      });
  };

  _enableNotification = async (username, isEnable, settings, accessToken = null) => {
    //compile notify_types
    let notify_types = [];
    if (settings) {
      const notifyTypesConst = {
        voteNotification: 1,
        mentionNotification: 2,
        followNotification: 3,
        commentNotification: 4,
        reblogNotification: 5,
        transfersNotification: 6,
      };

      Object.keys(settings).map((item) => {
        if (notifyTypesConst[item] && settings[item]) {
          notify_types.push(notifyTypesConst[item]);
        }
      });
    } else {
      notify_types = [1, 2, 3, 4, 5, 6];
    }

    messaging()
      .getToken()
      .then((token) => {
        setPushToken(
          {
            username,
            token: isEnable ? token : '',
            system: `fcm-${Platform.OS}`,
            allows_notify: Number(isEnable),
            notify_types,
          },
          accessToken,
        );
      });
  };

  _switchAccount = async (targetAccount) => {
    const { dispatch, isConnected } = this.props;

    if (!isConnected) return;

    dispatch(updateCurrentAccount(targetAccount));

    const accountData = await switchAccount(targetAccount.username);
    const realmData = await getUserDataWithUsername(targetAccount.username);

    let _currentAccount = accountData;
    _currentAccount.username = accountData.name;
    [_currentAccount.local] = realmData;

    //migreate account to use access token for master key auth type
    if (realmData[0].authType !== AUTH_TYPE.STEEM_CONNECT && realmData[0].accessToken === '') {
      _currentAccount = await migrateToMasterKeyWithAccessToken(
        _currentAccount,
        realmData[0],
        pinCode,
      );
    }

    //update refresh token
    _currentAccount = await this._refreshAccessToken(_currentAccount);

    try {
      _currentAccount.unread_activity_count = await getUnreadNotificationCount();
      _currentAccount.pointsSummary = await getPointsSummary(_currentAccount.username);
      _currentAccount.mutes = await getMutes(_currentAccount.username);
    } catch (err) {
      console.warn('Optional user data fetch failed, account can still function without them', err);
    }

    dispatch(updateCurrentAccount(_currentAccount));
    dispatch(fetchSubscribedCommunities(_currentAccount.username));
  };


  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      isDarkTheme: _isDarkTheme,
      selectedLanguage,
      isLogingOut,
      isConnected,
      api,
    } = this.props;

    if (
      _isDarkTheme !== nextProps.isDarkTheme ||
      selectedLanguage !== nextProps.selectedLanguage ||
      (api !== nextProps.api && nextProps.api)
    ) {
      this.setState(
        {
          isRenderRequire: false,
        },
        () =>
          this.setState({
            isRenderRequire: true,
          }),
      );
      if (nextProps.isDarkTheme) {
        changeNavigationBarColor('#1e2835');
      } else {
        changeNavigationBarColor('#FFFFFF', true);
      }
    }

    if (isLogingOut !== nextProps.isLogingOut && nextProps.isLogingOut) {
      this._logout();
    }

    if (isConnected !== null && isConnected !== nextProps.isConnected && nextProps.isConnected) {
      this._fetchApp();
    }
  }

  UNSAFE_componentWillMount() {
    const { isDarkTheme: _isDarkTheme } = this.props;
    EStyleSheet.build(_isDarkTheme ? darkTheme : lightTheme);
  }

  render() {
    const {
      selectedLanguage,
      isConnected,
      toastNotification,
      isDarkTheme: _isDarkTheme,
      children,
      rcOffer,
    } = this.props;
    const { isRenderRequire, foregroundNotificationData } = this.state;

    return (
      children &&
      children({
        isConnected,
        isDarkTheme: _isDarkTheme,
        isRenderRequire,
        locale: selectedLanguage,
        rcOffer,
        toastNotification,
        foregroundNotificationData,
      })
    );
  }
}

export default connect(
  (state) => ({
    // Application
    isDarkTheme: state.application.isDarkTheme,
    selectedLanguage: state.application.language,
    isPinCodeOpen: state.application.isPinCodeOpen,
    encUnlockPin: state.application.encUnlockPin,
    isLogingOut: state.application.isLogingOut,
    isLoggedIn: state.application.isLoggedIn, //TODO: remove as is not being used in this class
    isConnected: state.application.isConnected,
    api: state.application.api,
    isGlobalRenderRequired: state.application.isRenderRequired,
    isAnalytics: state.application.isAnalytics,
    lastUpdateCheck: state.application.lastUpdateCheck,
    settingsMigratedV2: state.application.settingsMigratedV2,
    isNotificationsEnabled: state.application.isNotificationOpen,
    notificationDetails: state.application.notificationDetails,

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
          fetchCoinQuotes,
        },
        dispatch,
      ),
    },
  }),
)(injectIntl(ApplicationContainer));
