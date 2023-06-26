import { Appearance } from 'react-native';
import Config from 'react-native-config';

// Constants
import THEME_OPTIONS from '../constants/options/theme';
import { getUnreadNotificationCount } from '../providers/ecency/ecency';
import { getPointsSummary } from '../providers/ecency/ePoint';
import {
  login,
  loginWithSC2,
  migrateToMasterKeyWithAccessToken,
  refreshSCToken,
  updatePinCode,
} from '../providers/hive/auth';
import { getDigitPinCode, getMutes } from '../providers/hive/dhive';
import AUTH_TYPE from '../constants/authType';

// Services
import { getSCAccount, getSettings, getUserDataWithUsername, removeUserData } from '../realm/realm';
import { updateCurrentAccount, updateOtherAccount } from '../redux/actions/accountAction';

import {
  changeNotificationSettings,
  changeAllNotificationSettings,
  setApi,
  setCurrency,
  setLanguage,
  setNsfw,
  isDefaultFooter,
  isPinCodeOpen,
  setColorTheme,
  setSettingsMigrated,
  setPinCode,
  setEncryptedUnlockPin,
  setPostUpvotePercent,
  setCommentUpvotePercent,
  setIsDarkTheme,
} from '../redux/actions/applicationActions';
import { fetchSubscribedCommunities } from '../redux/actions/communitiesAction';
import {
  hideActionModal,
  hideProfileModal,
  setRcOffer,
  showActionModal,
  toastNotification,
} from '../redux/actions/uiAction';
import { decryptKey, encryptKey } from './crypto';
import { Draft } from '../redux/reducers/cacheReducer';
import { delay } from './editor';
import RootNavigation from '../navigation/rootNavigation';
import ROUTES from '../constants/routeNames';

// migrates settings from realm to redux once and do no user realm for settings again;
export const migrateSettings = async (dispatch: any, settingsMigratedV2: boolean) => {
  if (settingsMigratedV2) {
    return;
  }

  // reset certain properties
  dispatch(hideActionModal());
  dispatch(hideProfileModal());
  dispatch(toastNotification(''));
  dispatch(setRcOffer(false));

  const settings = await getSettings();

  if (settings) {
    const isDarkMode = Appearance.getColorScheme() === 'dark';
    dispatch(setIsDarkTheme(settings.isDarkTheme !== null ? settings.isDarkTheme : isDarkMode));
    dispatch(setColorTheme(THEME_OPTIONS.findIndex((item) => item.value === settings.isDarkTheme)));
    await dispatch(isPinCodeOpen(!!settings.isPinCodeOpen));
    if (settings.language !== '') dispatch(setLanguage(settings.language));
    if (settings.server !== '') dispatch(setApi(settings.server));
    if (settings.upvotePercent !== '') {
      const percent = Number(settings.upvotePercent);
      dispatch(setPostUpvotePercent(percent));
      dispatch(setCommentUpvotePercent(percent));
    }
    if (settings.isDefaultFooter !== '') dispatch(isDefaultFooter(settings.isDefaultFooter)); // TODO: remove as not being used

    if (settings.nsfw !== '') dispatch(setNsfw(settings.nsfw));

    dispatch(setCurrency(settings.currency !== '' ? settings.currency : 'usd'));

    if (settings.notification !== '') {
      dispatch(
        changeNotificationSettings({
          type: 'notification',
          action: settings.notification,
        }),
      );

      dispatch(changeAllNotificationSettings(settings));
    }

    await dispatch(setSettingsMigrated(true));
  }
};

// migrates local user data to use default pin encruption instead of user pin encryption
export const migrateUserEncryption = async (dispatch, currentAccount, encUserPin, onFailure) => {
  const oldPinCode = decryptKey(encUserPin, Config.PIN_KEY);

  if (oldPinCode === undefined || oldPinCode === Config.DEFAULT_PIN) {
    return;
  }

  try {
    const pinData = {
      pinCode: Config.DEFAULT_PIN,
      username: currentAccount.username,
      oldPinCode,
    };

    const response = updatePinCode(pinData);

    const _currentAccount = currentAccount;
    _currentAccount.local = response;

    dispatch(
      updateCurrentAccount({
        ..._currentAccount,
      }),
    );

    const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
    dispatch(setPinCode(encryptedPin));
  } catch (err) {
    console.warn('pin update failure: ', err);
  }

  dispatch(setEncryptedUnlockPin(encUserPin));

  const realmData = await getUserDataWithUsername(currentAccount.name);

  let _currentAccount = currentAccount;
  _currentAccount.username = _currentAccount.name;
  _currentAccount.local = realmData[0];

  try {
    const pinHash = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
    // migration script for previously mast key based logged in user not having access token
    if (realmData[0].authType !== AUTH_TYPE.STEEM_CONNECT && realmData[0].accessToken === '') {
      _currentAccount = await migrateToMasterKeyWithAccessToken(
        _currentAccount,
        realmData[0],
        pinHash,
      );
    }

    // refresh access token
    const encryptedAccessToken = await refreshSCToken(_currentAccount.local, Config.DEFAULT_PIN);
    _currentAccount.local.accessToken = encryptedAccessToken;
  } catch (error) {
    onFailure(error);
  }

  // get unread notifications
  try {
    _currentAccount.unread_activity_count = await getUnreadNotificationCount();
    _currentAccount.pointsSummary = await getPointsSummary(_currentAccount.username);
    _currentAccount.mutes = await getMutes(_currentAccount.username);
  } catch (err) {
    console.warn('Optional user data fetch failed, account can still function without them', err);
  }

  dispatch(updateCurrentAccount({ ..._currentAccount }));
  dispatch(fetchSubscribedCommunities(_currentAccount.username));
};

export const repairUserAccountData = async (username, dispatch, intl, accounts, pinHash) => {
  try {
    // clean realm data just in case, to avoid already logged error
    await removeUserData(username);

    // extract key information from otherAccounts if data is available, use key to re-verify account;
    let _userAccount = accounts.find((account) => account.username === username);
    const _authType = _userAccount?.local?.authType;
    if (!_authType) {
      throw new Error('could not recover account data from redux copy');
    }

    if (_authType === AUTH_TYPE.STEEM_CONNECT) {
      const _scAccount = await getSCAccount(username);
      if (!_scAccount?.refreshToken) {
        throw new Error('refresh node not present');
      }
      _userAccount = await loginWithSC2(_scAccount.refreshToken);
      console.log('successfully repair hive signer based account data', username);
    } else {
      const _encryptedKey = _userAccount.local[_authType];
      const _key = decryptKey(_encryptedKey, getDigitPinCode(pinHash));
      if (!_key) {
        throw new Error('Pin decryption failed');
      }
      _userAccount = await login(username, _key);
      console.log('successfully repair key based account data', username, _key);
    }

    dispatch(updateCurrentAccount({ ..._userAccount }));
  } catch (err) {
    // keys data corrupted, ask user to verify login
    await delay(500);
    dispatch(
      showActionModal({
        title: intl.formatMessage({ id: 'alert.warning' }),
        body: intl.formatMessage({ id: 'alert.auth_expired' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            style: 'destructive',
            onPress: () => {},
          },
          {
            text: intl.formatMessage({ id: 'alert.verify' }),
            onPress: () => {
              RootNavigation.navigate({
                name: ROUTES.SCREENS.LOGIN,
                params: { username },
              });
            },
          },
        ],
      }),
    );
  }
};

export const repairOtherAccountsData = (accounts, realmAuthData, dispatch) => {
  accounts.forEach((account) => {
    const accRealmData = realmAuthData.find((data) => data.username === account.name);
    if ((!account.local?.accessToken || !account.username) && accRealmData) {
      account.local = accRealmData;
      account.username = accRealmData.username;
      dispatch(updateOtherAccount({ ...account }));
    }
  });
};

const reduxMigrations = {
  0: (state) => {
    const { upvotePercent } = state.application;
    state.application.postUpvotePercent = upvotePercent;
    state.application.commentUpvotePercent = upvotePercent;
    state.application.upvotePercent = undefined;
    return state;
  },
  1: (state) => {
    state.application.notificationDetails.favoriteNotification = true;
    return state;
  },
  2: (state) => {
    state.application.notificationDetails.bookmarkNotification = true;
    return state;
  },
  3: (state) => {
    const { drafts } = state.cache;
    const _draftsCollection = {};
    if (drafts instanceof Array) {
      drafts.forEach(([key, data]) => {
        if (key && data.body && data.author && data.updated) {
          _draftsCollection[key] = data;
        }
      });
    }
    state.cache.draftsCollection = _draftsCollection;
    delete state.cache.drafts;
    return state;
  },
  4: (state) => {
    const { comments } = state.cache;
    const _collection = {};
    if (comments instanceof Array) {
      comments.forEach(([key, data]) => {
        if (key && data.body && data.parent_author && data.parent_permlink) {
          _collection[key] = data;
        }
      });
    }
    state.cache.commentsCollection = _collection;
    delete state.cache.comments;
    return state;
  },
  5: (state) => {
    state.cache.votesCollection = {};
    return state;
  },
};

export default {
  migrateSettings,
  migrateUserEncryption,
  reduxMigrations,
};
