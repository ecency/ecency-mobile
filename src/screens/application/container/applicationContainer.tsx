import { Component } from 'react';
import DeviceInfo from 'react-native-device-info';

import { Platform, Alert, Linking, AppState, NativeEventSubscription } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Config from 'react-native-config';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { getMessaging } from '@react-native-firebase/messaging';
import VersionNumber from 'react-native-version-number';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

// Constants
import { SheetManager } from 'react-native-actions-sheet';
import * as Sentry from '@sentry/react-native';
import {
  getMutedUsersQueryOptions,
  getAccountFullQueryOptions,
  getNotificationsUnreadCountQueryOptions,
} from '@ecency/sdk';
import AUTH_TYPE from '../../../constants/authType';
import ROUTES from '../../../constants/routeNames';

// Services
import {
  getUserData,
  removeUserData,
  getUserDataWithUsername,
  removePinCode,
  setAuthStatus,
  removeSCAccount,
  setExistUser,
  getLastUpdateCheck,
  setLastUpdateCheck,
} from '../../../realm/realm';
import { getDigitPinCode } from '../../../providers/hive/dhive';
import { getQueryClient } from '../../../providers/queries';
import { getPointsSummary } from '../../../providers/ecency/ePoint';
import {
  migrateToMasterKeyWithAccessToken,
  refreshSCToken,
  switchAccount,
} from '../../../providers/hive/auth';
import { setPushToken } from '../../../providers/ecency/ecency';
import { decryptKey } from '../../../utils/crypto';
import { fetchLatestAppVersion } from '../../../providers/github/github';
import RootNavigation from '../../../navigation/rootNavigation';
import {
  bootstrapMattermostSession,
  fetchMattermostChannels,
} from '../../../providers/chat/mattermost';

// Actions
import {
  updateCurrentAccount,
  updateUnreadActivityCount,
  removeOtherAccount,
  fetchGlobalProperties,
  setPrevLoggedInUsers,
} from '../../../redux/actions/accountAction';
import {
  login,
  setConnectivityStatus,
  setPinCode as savePinCode,
  isRenderRequired,
  isPinCodeOpen,
  setEncryptedUnlockPin,
  setFCMAvailable,
} from '../../../redux/actions/applicationActions';
import {
  setAvatarCacheStamp,
  toastNotification,
  updateActiveBottomTab,
  logout,
  logoutDone,
  updateUnreadChatCount,
} from '../../../redux/actions/uiAction';
import { setFeedPosts, setInitPosts } from '../../../redux/actions/postsAction';
import { fetchCoinQuotes } from '../../../redux/actions/walletActions';

import { decryptKey, encryptKey } from '../../../utils/crypto';

import parseVersionNumber from '../../../utils/parseVersionNumber';
import { setMomentLocale } from '../../../utils/time';
import { purgeExpiredCache } from '../../../redux/actions/cacheActions';
import { fetchSubscribedCommunities } from '../../../redux/actions/communitiesAction';
import MigrationHelpers, {
  repairOtherAccountsData,
  repairUserAccountData,
} from '../../../utils/migrationHelpers';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectIsDarkTheme,
  selectLanguage,
  selectPin,
  selectIsPinCodeOpen,
  selectOtherAccounts,
  selectIsConnected,
  selectPrevLoggedInUsers,
  selectNotificationDetails,
  selectEncUnlockPin,
  selectIsNotificationOpen,
  selectApi,
  selectSettingsMigratedV2,
  selectIsGlobalRenderRequired,
  selectLastUpdateCheck,
  selectCurrentAccountUnreadActivityCount,
} from '../../../redux/selectors';

let firebaseOnMessageListener: any = null;
let appStateSub: NativeEventSubscription | null = null;

class ApplicationContainer extends Component {
  _pinCodeTimer: any = null;

  _notificationWs: WebSocket | null = null;

  _notificationUsername: string | null = null;

  _wsReconnectTimer: any = null;

  _wsReconnectAttempts: number = 0;

  _fcmAvailable: boolean | null = null; // Cache FCM availability check

  constructor(props) {
    super(props);
    this.state = {
      isRenderRequire: true,
      // isIos: Platform.OS !== 'android',
      appState: AppState.currentState,
      foregroundNotificationData: null,
    };
  }

  componentDidMount = async () => {
    const { dispatch } = this.props;
    this._setNetworkListener();

    appStateSub = AppState.addEventListener('change', this._handleAppStateChange);

    // Only create FCM listener if FCM is available
    const fcmAvailable = await this._checkFCMAvailability();
    if (fcmAvailable) {
      this._createPushListener();
      console.log('Using FCM for foreground notifications');
    } else {
      console.log('FCM not available - will use WebSocket fallback when user logs in');
    }

    // set avatar cache stamp to invalidate previous session avatars
    dispatch(setAvatarCacheStamp(new Date().getTime()));

    setMomentLocale();
    this._fetchApp();

    ReceiveSharingIntent.getReceivedFiles(
      (files) => {
        RootNavigation.navigate({
          name: ROUTES.SCREENS.EDITOR,
          params: { hasSharedIntent: true, files },
        });
        // files returns as JSON Array example
        // [{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
        ReceiveSharingIntent.clearReceivedFiles(); // clear Intents
      },
      (error) => {
        console.log('error :>> ', error);
      },
    );
  };

  componentDidUpdate(prevProps) {
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

    // TOOD: listen for back press and cancel all pending api requests;

    if (appStateSub) {
      appStateSub.remove();
    }

    if (_isPinCodeOpen) {
      clearTimeout(this._pinCodeTimer);
    }

    if (firebaseOnMessageListener) {
      firebaseOnMessageListener();
    }

    this._disconnectNotificationServer();

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

  _compareAndPromptForUpdate = async () => {
    const recheckInterval = 48 * 3600 * 1000; // 2 days
    const { intl } = this.props;

    const lastUpdateCheck = await getLastUpdateCheck();

    if (lastUpdateCheck) {
      const timeDiff = new Date().getTime() - lastUpdateCheck;
      if (timeDiff < recheckInterval) {
        return;
      }
    }

    const remoteVersion = await fetchLatestAppVersion();

    if (parseVersionNumber(remoteVersion) > parseVersionNumber(VersionNumber.appVersion)) {
      SheetManager.show(SheetNames.ACTION_MODAL, {
        payload: {
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
                DeviceInfo.getInstallerPackageName().then((installerPackageName) => {
                  let _url = 'https://github.com/ecency/ecency-mobile/releases';
                  switch (installerPackageName) {
                    case 'com.android.vending':
                      _url = 'market://details?id=app.esteem.mobile.android';
                      break;
                    case 'AppStore':
                      _url = 'itms-apps://itunes.apple.com/us/app/apple-store/id1451896376?mt=8';
                      break;
                  }
                  Linking.openURL(_url);
                });
              },
            },
          ],
          headerImage: require('../../../assets/phone-holding.png'),
        },
      });
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
    const { isPinCodeOpen: _isPinCodeOpen } = this.props;
    const { appState } = this.state;

    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this._refreshGlobalProps();
      this._refreshUnreadActivityCount();
      this._refreshUnreadChats();
      if (_isPinCodeOpen && this._pinCodeTimer) {
        clearTimeout(this._pinCodeTimer);
      }
    }

    if (appState.match(/active|forground/) && nextAppState === 'inactive') {
      this._startPinCodeTimer();
    }

    this.setState({
      appState: nextAppState,
    });
  };

  _fetchApp = async () => {
    const { dispatch, settingsMigratedV2 } = this.props;

    await MigrationHelpers.migrateSettings(dispatch, settingsMigratedV2);

    this._refreshGlobalProps();
    await this._getUserDataFromRealm();
    await this._refreshUnreadChats();
    this._compareAndPromptForUpdate();
    this._registerDeviceForNotifications();
    dispatch(purgeExpiredCache());
  };

  _startPinCodeTimer = () => {
    const { isPinCodeOpen: _isPinCodeOpen } = this.props;
    if (_isPinCodeOpen) {
      this._pinCodeTimer = setTimeout(() => {
        RootNavigation.navigate({
          name: ROUTES.SCREENS.PINCODE,
        });
      }, 1 * 60 * 1000);
    }
  };

  _showNotificationToast = (remoteMessage) => {
    const { dispatch } = this.props;

    if (remoteMessage && remoteMessage.notification) {
      const { title } = remoteMessage.notification;
      dispatch(toastNotification(title));
    }
  };

  _createPushListener = async () => {
    await getMessaging().requestPermission();

    firebaseOnMessageListener = getMessaging().onMessage((remoteMessage) => {
      console.log('Notification Received: foreground', remoteMessage);

      const { unreadActivityCount, dispatch } = this.props;

      const notificationTypes = ['mention', 'reply', 'transfer', 'delegations'];
      const messageType = remoteMessage?.data?.type;
      if (notificationTypes.includes(messageType)) {
        // Increment unread count (was only done by websocket before)
        dispatch(updateUnreadActivityCount(unreadActivityCount + 1));
      }

      // Show foreground notification banner
      this.setState({
        foregroundNotificationData: remoteMessage,
      });
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

  _refreshUnreadActivityCount = async () => {
    const { dispatch, isLoggedIn, currentAccount, pinCode } = this.props;
    if (isLoggedIn && currentAccount) {
      const username = currentAccount.name;
      const accessToken = currentAccount?.local?.accessToken
        ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
        : '';
      const queryClient = getQueryClient();
      const unreadActivityCount = await queryClient.fetchQuery(
        getNotificationsUnreadCountQueryOptions(username, accessToken),
      );
      dispatch(updateUnreadActivityCount(unreadActivityCount));
    }
  };

  _getChannelUnreadTotal = (channel: any) => {
    if (channel?.is_muted) {
      return 0;
    }

    const unreadMentionValues = [
      channel?.unread_mentions,
      channel?.mention_count,
      channel?.mentions_count,
      channel?.mention_count_root,
      channel?.urgent_mention_count,
      channel?.channel_wide_mention_count,
    ].filter((value) => Number.isFinite(value)) as number[];

    const unreadMentions = unreadMentionValues.length ? Math.max(0, ...unreadMentionValues) : 0;

    const unreadMessages = Number.isFinite(channel?.unread_messages)
      ? channel.unread_messages
      : Number.isFinite(channel?.unread_msg_count)
      ? channel.unread_msg_count
      : Number.isFinite(channel?.unread_count)
      ? channel.unread_count
      : 0;

    return Math.max(0, unreadMentions) + Math.max(0, unreadMessages);
  };

  _normalizeChannels = (rawChannels: any): any[] => {
    if (!rawChannels) {
      return [];
    }

    if (Array.isArray(rawChannels)) {
      return rawChannels;
    }

    if (Array.isArray(rawChannels.channels)) {
      return rawChannels.channels;
    }

    return [];
  };

  _refreshUnreadChats = async () => {
    const { dispatch, isLoggedIn, isConnected, currentAccount, pinCode } = this.props;

    if (!isLoggedIn || !currentAccount?.name) {
      dispatch(updateUnreadChatCount(0));
      return;
    }

    if (isConnected === false) {
      return;
    }

    try {
      await bootstrapMattermostSession(currentAccount, pinCode);
      const channels = this._normalizeChannels(await fetchMattermostChannels());
      const unreadTotal = channels.reduce(
        (total: number, channel: any) => total + this._getChannelUnreadTotal(channel),
        0,
      );

      dispatch(updateUnreadChatCount(unreadTotal));
    } catch (error) {
      dispatch(updateUnreadChatCount(0));
    }
  };

  _checkHiveAuthExpiry = (authData: any) => {
    const { intl } = this.props;

    // Only check expiry for session-based authentication (HiveAuth/Keychain or HiveSigner)
    // Skip for private key accounts (masterKey, postingKey, etc.)
    const isSessionBasedAuth =
      authData?.authType === AUTH_TYPE.HIVE_AUTH || authData?.authType === AUTH_TYPE.STEEM_CONNECT;

    if (
      authData?.username &&
      isSessionBasedAuth &&
      authData.hiveAuthExpiry &&
      typeof authData.hiveAuthExpiry === 'number' &&
      authData.hiveAuthExpiry > 0
    ) {
      const curTime = new Date().getTime();
      if (curTime > authData.hiveAuthExpiry) {
        SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'alert.warning' }),
            body: intl.formatMessage({ id: 'alert.auth_expired' }),
            buttons: [
              {
                text: intl.formatMessage({ id: 'alert.cancel' }),
                style: 'destructive',
                onPress: () => {
                  console.log('cancel pressed');
                },
              },
              {
                text: intl.formatMessage({ id: 'alert.verify' }),
                onPress: () => {
                  RootNavigation.navigate({
                    name: ROUTES.SCREENS.LOGIN,
                    params: { username: authData.username },
                  });
                },
              },
            ],
          },
        });
      }
    }
  };

  _getUserDataFromRealm = async () => {
    const {
      dispatch,
      isPinCodeOpen: _isPinCodeOpen,
      isConnected,
      otherAccounts,
      currentAccount,
    } = this.props;
    let realmData = [];

    if (currentAccount?.name) {
      dispatch(login(true));

      const username = currentAccount.name;

      const userData = await getUserData();

      if (userData && userData.length > 0) {
        realmData = userData;
        userData.forEach((accountData, index) => {
          if (
            !accountData ||
            (!accountData.accessToken &&
              !accountData.masterKey &&
              !accountData.postingKey &&
              !accountData.activeKey &&
              !accountData.memoKey)
          ) {
            realmData.splice(index, 1);
            removeSCAccount(accountData.username);
            removeUserData(accountData.username);
          }
        });
      }

      let [authData]: any = realmData.filter((data) => data.username === username);

      // reapir otherAccouts data is needed
      // this repair must be done because code above makes sure every entry is realmData is a valid one
      repairOtherAccountsData(otherAccounts, realmData, dispatch);

      if (!authData) {
        // means current logged in user keys data not present, re-verify required
        authData = await this._repairUserAccountData(username);

        // disrupt routine if repair helper fails
        if (!authData) {
          return null;
        }
      }

      // check session expiry in case of HIVE_AUTH
      if (authData.authType === AUTH_TYPE.HIVE_AUTH) {
        this._checkHiveAuthExpiry(authData);
      }

      // If in dev mode pin code does not show
      if (_isPinCodeOpen) {
        RootNavigation.navigate({ name: ROUTES.SCREENS.PINCODE });
      } else if (!_isPinCodeOpen) {
        const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
        dispatch(savePinCode(encryptedPin));
      }

      if (isConnected) {
        this._fetchUserDataFromDsteem(authData);
      }

      return authData;
    }
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
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            style: 'destructive',
          },
        ],
      );
      return currentAccount;
    }
  };

  _fetchUserDataFromDsteem = async (realmObject) => {
    const { dispatch, intl, pinCode, isPinCodeOpen, encUnlockPin } = this.props;

    try {
      const queryClient = getQueryClient();
      const sdkAccountData = await queryClient.fetchQuery(
        getAccountFullQueryOptions(realmObject.username),
      );
      let accountData = { ...sdkAccountData, local: realmObject };

      // cannot migrate or refresh token since pin would null while pin code modal is open
      if (!isPinCodeOpen || encUnlockPin) {
        // migration script for previously mast key based logged in user not having access token
        if (
          realmObject.authType !== AUTH_TYPE.STEEM_CONNECT &&
          realmObject.authType !== AUTH_TYPE.HIVE_AUTH &&
          realmObject.accessToken === ''
        ) {
          accountData = await migrateToMasterKeyWithAccessToken(accountData, realmObject, pinCode);
        }

        // refresh access token
        accountData = await this._refreshAccessToken(accountData);
      }

      try {
        const accessToken = realmObject.accessToken
          ? decryptKey(realmObject.accessToken, getDigitPinCode(pinCode))
          : '';
        accountData.unread_activity_count = await queryClient.fetchQuery(
          getNotificationsUnreadCountQueryOptions(realmObject.username, accessToken),
        );

        // Fetch muted users using SDK query
        accountData.mutes = await queryClient.fetchQuery(
          getMutedUsersQueryOptions(realmObject.username),
        );

        accountData.pointsSummary = await getPointsSummary(realmObject.username);
      } catch (err) {
        console.warn(
          'Optional user data fetch failed, account can still function without them',
          err,
        );
      }
      dispatch(updateCurrentAccount(accountData));
      dispatch(fetchSubscribedCommunities(realmObject.username));

      // Connect to notification server based on FCM availability
      // If FCM is available, it will handle notifications
      // If not, use WebSocket as fallback
      const fcmAvailable = await this._checkFCMAvailability();
      if (!fcmAvailable) {
        console.log('Connecting to WebSocket notification server (FCM not available)');
        this._connectNotificationServer(accountData.name);
      } else {
        console.log('Using FCM for notifications (WebSocket not needed)');
        // Ensure any previous websocket is disconnected
        this._disconnectNotificationServer();
      }

      // TODO: better update device push token here after access token refresh
    } catch (err) {
      Alert.alert(
        `${intl.formatMessage({
          id: 'alert.fetch_error',
        })} \n${err.message.substr(0, 20)}`,
      );
    }
  };

  // update notification settings and update push token for each signed accoutn useing access tokens
  _registerDeviceForNotifications = (settings?: any) => {
    const { currentAccount, otherAccounts, notificationDetails, isNotificationsEnabled } =
      this.props;

    const isEnabled = settings ? !!settings.notification : isNotificationsEnabled;
    settings = settings || notificationDetails;

    const _enabledNotificationForAccount = (account) => {
      const encAccessToken = account?.local?.accessToken;
      this._enableNotification(account.name, isEnabled, settings, encAccessToken);
    };

    // updateing fcm token with settings;
    otherAccounts.forEach((account) => {
      // since there can be more than one accounts, process access tokens separate
      if (account?.local?.accessToken) {
        _enabledNotificationForAccount(account);
      } else {
        console.warn('access token not present, reporting to Sentry');
        Sentry.captureException(
          new Error(
            `Reporting missing access token in other accounts section: account:${
              account.name
            } with local data ${JSON.stringify(account?.local)}`,
          ),
        );

        // fallback to current account access token to register atleast logged in account
        if (currentAccount.name === account.name) {
          _enabledNotificationForAccount(currentAccount);
        }
      }
    });
  };

  /**
   * Check if FCM (Firebase Cloud Messaging) is available on this device
   * Returns cached result if already checked
   *
   * FCM requires:
   * - iOS: APNS (Apple Push Notification Service) - not available on simulators
   * - Android: Google Play Services - not available on custom ROMs, Huawei devices, emulators without Google APIs
   */
  _checkFCMAvailability = async (): Promise<boolean> => {
    const { dispatch } = this.props;

    // Return cached result if already checked
    if (this._fcmAvailable !== null) {
      return this._fcmAvailable;
    }

    try {
      // iOS Simulator check - APNS not available
      const isEmulator = await DeviceInfo.isEmulator();
      if (Platform.OS === 'ios' && isEmulator) {
        console.log('FCM not available: iOS Simulator (no APNS)');
        this._fcmAvailable = false;
        dispatch(setFCMAvailable(false));
        return false;
      }

      // Check permission without prompting
      const authStatus = await getMessaging().hasPermission();
      const permissionGranted = authStatus === 1 || authStatus === 2; // authorized or provisional

      if (!permissionGranted) {
        console.log('FCM not available: User denied notification permission');
        this._fcmAvailable = false;
        dispatch(setFCMAvailable(false));
        return false;
      }

      // Try to get FCM token - this will fail if FCM isn't available
      const token = await getMessaging().getToken();

      if (token) {
        console.log('FCM is available - token obtained');
        this._fcmAvailable = true;
        dispatch(setFCMAvailable(true));
        return true;
      } else {
        console.log('FCM not available: No token returned');
        this._fcmAvailable = false;
        dispatch(setFCMAvailable(false));
        return false;
      }
    } catch (error) {
      const errorMessage = error.message || '';

      // Expected errors when FCM is not available
      if (
        errorMessage.includes('MISSING_INSTANCEID_SERVICE') ||
        errorMessage.includes('SERVICE_NOT_AVAILABLE') ||
        errorMessage.includes('AUTHENTICATION_FAILED') ||
        errorMessage.includes('APNS')
      ) {
        console.log('FCM not available:', errorMessage);
        this._fcmAvailable = false;
        dispatch(setFCMAvailable(false));
        return false;
      }

      // Unexpected error - assume FCM not available to be safe
      console.warn('FCM availability check failed:', error);
      this._fcmAvailable = false;
      dispatch(setFCMAvailable(false));
      return false;
    }
  };

  _disconnectNotificationServer = () => {
    if (this._notificationWs) {
      console.log('Disconnecting notification websocket');
      this._notificationWs.close();
      this._notificationWs = null;
    }
    if (this._wsReconnectTimer) {
      clearTimeout(this._wsReconnectTimer);
      this._wsReconnectTimer = null;
    }
    this._wsReconnectAttempts = 0;
  };

  _connectNotificationServer = (username) => {
    // Clean up existing connection first
    this._disconnectNotificationServer();

    if (!username || !Config.ACTIVITY_WEBSOCKET_URL) {
      console.log('Skipping websocket - missing username or URL');
      return;
    }

    try {
      const safeUsername = encodeURIComponent(username);
      this._notificationUsername = username;
      console.log('Connecting notification websocket for user:', username);
      const ws = new WebSocket(`${Config.ACTIVITY_WEBSOCKET_URL}?user=${safeUsername}`);
      this._notificationWs = ws;

      ws.onopen = () => {
        console.log('Notification websocket connected');
        this._wsReconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        const { activeBottomTab, unreadActivityCount, dispatch } = this.props;

        console.log('Websocket notification received:', event.data);

        // Try to parse notification data from enotify-py websocket
        // Format: { event: "notify", type: "mention"|"reply", source: "username", target: "username", extra: {...}, timestamp: "..." }
        let wsData = null;
        try {
          if (event.data) {
            wsData = JSON.parse(event.data);
          }
        } catch (err) {
          console.log('Websocket message is not JSON, treating as simple ping');
        }

        // Convert enotify-py websocket format to FCM format for ForegroundNotification component
        if (
          wsData &&
          wsData.event === 'notify' &&
          (wsData.type === 'mention' ||
            wsData.type === 'reply' ||
            wsData.type === 'transfer' ||
            wsData.type === 'delegations')
        ) {
          // Update unread count only for real notifications
          dispatch(updateUnreadActivityCount(unreadActivityCount + 1));
          const { type, source, target, extra } = wsData;

          // Build FCM-compatible notification object
          const fcmFormat = {
            data: {
              id: `ws-${Date.now()}`,
              source,
              target,
              type,
              // For mentions/replies: extra.permlink
              // For transfers/delegations: no permlink needed
              permlink1: (extra?.permlink || '').substring(0, 250),
              permlink2: (extra?.permlink || '').substring(250, 500),
              permlink3: (extra?.permlink || '').substring(500, 750),
              // For transfers/delegations: extra.amount
              amount: extra?.amount || '',
            },
            notification: {
              title:
                type === 'mention'
                  ? `@${source} mentioned @${target}`
                  : type === 'reply'
                  ? `@${source} replied to @${target}`
                  : type === 'transfer'
                  ? `@${source} transferred to @${target}`
                  : `@${source} delegated to @${target}`,
              body:
                type === 'reply' && extra?.body
                  ? extra.body.substring(0, 100)
                  : type === 'transfer' || type === 'delegations'
                  ? extra?.amount || ''
                  : '',
            },
          };

          console.log('Converted websocket to FCM format:', fcmFormat);
          this.setState({
            foregroundNotificationData: fcmFormat,
          });
        }

        // Workaround: Force refresh notification tab if active
        if (activeBottomTab === ROUTES.TABBAR.NOTIFICATION) {
          dispatch(updateActiveBottomTab(''));
          dispatch(updateActiveBottomTab(ROUTES.TABBAR.NOTIFICATION));
        }
      };

      ws.onerror = (error) => {
        console.warn('Notification websocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('Notification websocket closed:', event.code, event.reason);
        this._notificationWs = null;

        // Only reconnect if not a normal closure and component is still mounted
        if (event.code !== 1000 && this._wsReconnectAttempts < 5) {
          this._wsReconnectAttempts++;
          const delay = Math.min(1000 * 2 ** this._wsReconnectAttempts, 30000);
          const latestUsername =
            this.props?.currentAccount?.name || this._notificationUsername || username;
          console.log(
            `Reconnecting websocket in ${delay}ms (attempt ${this._wsReconnectAttempts})`,
          );

          this._wsReconnectTimer = setTimeout(() => {
            if (latestUsername) {
              this._connectNotificationServer(latestUsername);
            }
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create notification websocket:', error);
    }
  };

  _repairUserAccountData = async (username) => {
    const { dispatch, intl, otherAccounts, currentAccount, pinCode } = this.props;

    // use current account variant if it exist of target account;
    const _accounts = currentAccount.name === username ? [currentAccount] : otherAccounts;
    return repairUserAccountData(username, dispatch, intl, _accounts, pinCode);
  };

  // update previously loggedin users list,
  _updatePrevLoggedInUsersList = (username: string) => {
    const { dispatch, prevLoggedInUsers } = this.props as any;
    if (prevLoggedInUsers && prevLoggedInUsers.length > 0) {
      const userIndex = prevLoggedInUsers.findIndex((el: any) => el?.username === username);

      if (userIndex > -1) {
        const updatedPrevLoggedInUsers = [...prevLoggedInUsers];
        updatedPrevLoggedInUsers[userIndex] = { username, isLoggedOut: true };
        dispatch(setPrevLoggedInUsers(updatedPrevLoggedInUsers));
      } else {
        const u = { username, isLoggedOut: true };
        dispatch(setPrevLoggedInUsers([...prevLoggedInUsers, u]));
      }
    } else {
      const u = { username, isLoggedOut: true };
      dispatch(setPrevLoggedInUsers([u]));
    }
  };

  _logout = async (username) => {
    const { currentAccount, otherAccounts, dispatch, intl } = this.props;

    try {
      const response = await removeUserData(username);

      if (response instanceof Error) {
        throw response;
      }
      this._updatePrevLoggedInUsersList(username);

      const encAccessToken =
        currentAccount.name === username ? currentAccount?.local?.accessToken : null;
      this._enableNotification(username, false, null, encAccessToken);

      // switch account if other account exist
      const _otherAccounts = otherAccounts.filter((user) => user.username !== username);

      if (_otherAccounts.length > 0) {
        const targetAccount = _otherAccounts[0];
        await this._switchAccount(targetAccount);
      }

      // logut from app if no more other accounts
      else {
        dispatch(updateCurrentAccount({}));
        dispatch(login(false));
        removePinCode();
        setAuthStatus({
          isLoggedIn: false,
        });
        setExistUser(false);
        dispatch(isPinCodeOpen(false));
        dispatch(setEncryptedUnlockPin(encryptKey(Config.DEFAULT_KEU, Config.PIN_KEY)));
      }

      removeSCAccount(username);
      dispatch(setFeedPosts([]));
      dispatch(setInitPosts([]));
      dispatch(removeOtherAccount(username));
      dispatch(logoutDone());
    } catch (err) {
      dispatch(logoutDone());
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), err.message);
      this._repairUserAccountData(username);
    }
  };

  _enableNotification = async (username, isEnable, settings = null, encAccesstoken = null) => {
    const accessToken = encAccesstoken ? decryptKey(encAccesstoken, Config.DEFAULT_PIN) : null;

    // compile notify_types
    let notify_types = [];
    if (settings) {
      const notifyTypesConst = {
        voteNotification: 1,
        mentionNotification: 2,
        followNotification: 3,
        commentNotification: 4,
        reblogNotification: 5,
        transfersNotification: 6,
        favoriteNotification: 13,
        bookmarkNotification: 15,
      };

      Object.keys(settings).forEach((item) => {
        if (notifyTypesConst[item] && settings[item]) {
          notify_types.push(notifyTypesConst[item]);
        }
      });
    } else {
      notify_types = [1, 2, 3, 4, 5, 6, 13, 15];
    }

    try {
      // Check if we're on iOS simulator where APNS isn't available
      const isSimulator = await DeviceInfo.isEmulator();
      if (Platform.OS === 'ios' && isSimulator) {
        console.log('Skipping FCM token on iOS simulator - APNS not available');
        return;
      }

      // Request permission first to ensure APNS is set up on iOS
      const authStatus = await getMessaging().requestPermission();
      const enabled =
        authStatus === 1 || // authorized
        authStatus === 2; // provisional

      if (!enabled) {
        console.log('Notification permission not granted');
        return;
      }

      const token = await getMessaging().getToken();
      console.log('FCM Token:', token);
      setPushToken(
        {
          username,
          token,
          system: `fcm-${Platform.OS}`,
          allows_notify: Number(isEnable),
          notify_types,
        },
        accessToken,
      );
    } catch (error) {
      // Handle platform-specific FCM errors gracefully
      const errorMessage = error.message || '';
      const isUnknownError = error.code === 'messaging/unknown';

      if (Platform.OS === 'ios' && (isUnknownError || errorMessage.includes('APNS'))) {
        // iOS: APNS not available (likely simulator or development environment)
        console.log('APNS not available on iOS - likely simulator or missing configuration');
      } else if (
        Platform.OS === 'android' &&
        (errorMessage.includes('MISSING_INSTANCEID_SERVICE') ||
          errorMessage.includes('SERVICE_NOT_AVAILABLE') ||
          errorMessage.includes('AUTHENTICATION_FAILED'))
      ) {
        // Android: Google Play Services issues (common on emulators, custom ROMs, outdated devices)
        console.log(
          'Google Play Services not available or misconfigured - FCM disabled for this device',
        );
        // Don't send to Sentry as this is expected on some Android configurations
      } else {
        // Unexpected error - log and report to Sentry
        console.warn('Failed to enable notification:', error);
        Sentry.captureException(error);
      }
    }
  };

  _switchAccount = async (targetAccount) => {
    const { dispatch, isConnected, pinCode, intl } = this.props;

    if (!isConnected) return;

    try {
      const accountData = await switchAccount(targetAccount.username);
      let realmData = await getUserDataWithUsername(targetAccount.username);

      let _currentAccount = accountData;
      _currentAccount.name = accountData.name;
      [_currentAccount.local] = realmData;

      if (!realmData[0]) {
        realmData = await this._repairUserAccountData(targetAccount.username);

        // disrupt routine if repair helper fails
        if (!realmData[0]) {
          return;
        }
      }

      // migreate account to use access token for master key auth type
      if (
        realmData[0].authType !== AUTH_TYPE.STEEM_CONNECT &&
        realmData[0].authType !== AUTH_TYPE.HIVE_AUTH &&
        realmData[0].accessToken === ''
      ) {
        _currentAccount = await migrateToMasterKeyWithAccessToken(
          _currentAccount,
          realmData[0],
          pinCode,
        );
      }

      // check session expiry in case of HIVE_AUTH
      if (realmData[0].authType === AUTH_TYPE.HIVE_AUTH) {
        this._checkHiveAuthExpiry(realmData[0]);
      }

      // update refresh token
      _currentAccount = await this._refreshAccessToken(_currentAccount);

      try {
        const queryClient = getQueryClient();
        const accessToken = _currentAccount?.local?.accessToken
          ? decryptKey(_currentAccount.local.accessToken, getDigitPinCode(pinCode))
          : '';
        _currentAccount.unread_activity_count = await queryClient.fetchQuery(
          getNotificationsUnreadCountQueryOptions(_currentAccount.name, accessToken),
        );
        _currentAccount.pointsSummary = await getPointsSummary(_currentAccount.name);

        // Fetch muted users using SDK query
        _currentAccount.mutes = await queryClient.fetchQuery(
          getMutedUsersQueryOptions(_currentAccount.name),
        );
      } catch (err) {
        console.warn(
          'Optional user data fetch failed, account can still function without them',
          err,
        );
      }

      dispatch(updateCurrentAccount(_currentAccount));
      dispatch(fetchSubscribedCommunities(_currentAccount.name));

      // Ensure notification channel is connected for the new account
      try {
        const fcmAvailable = await this._checkFCMAvailability();
        if (!fcmAvailable) {
          console.log('Connecting to WebSocket notification server (FCM not available)');
          this._connectNotificationServer(_currentAccount.name);
        } else {
          console.log('Using FCM for notifications (WebSocket not needed)');
          this._disconnectNotificationServer();
        }
      } catch (wsErr) {
        console.warn('Failed to update notification channel after account switch', wsErr);
      }
    } catch (err) {
      dispatch(
        toastNotification(
          `${intl.formatMessage(
            { id: 'alert.logging_out' },
            { username: targetAccount.username },
          )}\n${err.message}`,
        ),
      );
      this._logout(targetAccount.username);
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      isDarkTheme: _isDarkTheme,
      currentAccount: { name },
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
      this._logout(name);
    }

    if (isConnected !== null && isConnected !== nextProps.isConnected && nextProps.isConnected) {
      this._fetchApp();
    }
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
    isDarkTheme: selectIsDarkTheme(state),
    selectedLanguage: selectLanguage(state),
    isPinCodeOpen: selectIsPinCodeOpen(state),
    encUnlockPin: selectEncUnlockPin(state),

    isLoggedIn: selectIsLoggedIn(state),
    isConnected: selectIsConnected(state),
    api: selectApi(state),
    isGlobalRenderRequired: selectIsGlobalRenderRequired(state),
    lastUpdateCheck: selectLastUpdateCheck(state),
    settingsMigratedV2: selectSettingsMigratedV2(state),
    isNotificationsEnabled: selectIsNotificationOpen(state),
    notificationDetails: selectNotificationDetails(state),

    // Account
    unreadActivityCount: selectCurrentAccountUnreadActivityCount(state),
    currentAccount: selectCurrentAccount(state),
    otherAccounts: selectOtherAccounts(state),
    prevLoggedInUsers: selectPrevLoggedInUsers(state),
    pinCode: selectPin(state),

    // UI
    toastNotification: state.ui.toastNotification,
    activeBottomTab: state.ui.activeBottomTab,
    isLogingOut: state.ui.isLogingOut,
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
