import { Appearance } from 'react-native';
import Config from 'react-native-config';

// Constants
import { SheetManager } from 'react-native-actions-sheet';
import { isArray } from 'lodash';
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
import { setRcOffer, toastNotification } from '../redux/actions/uiAction';
import { decryptKey, encryptKey } from './crypto';
import { delay } from './editor';
import RootNavigation from '../navigation/rootNavigation';
import ROUTES from '../constants/routeNames';
import { DEFAULT_FEED_FILTERS } from '../constants/options/filters';
import { SheetNames } from '../navigation/sheets';
import { ProfileToken, TokenType } from '../screens/assetsSelect/screen/assetsSelect';
import DEFAULT_ASSETS from '../constants/defaultAssets';

// migrates settings from realm to redux once and do no user realm for settings again;
export const migrateSettings = async (dispatch: any, settingsMigratedV2: boolean) => {
  if (settingsMigratedV2) {
    return;
  }

  // reset certain properties
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
  [_currentAccount.local] = realmData;

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
  let authData: any[] = [];
  try {
    // clean realm data just in case, to avoid already logged error
    await removeUserData(username);

    // extract key information from otherAccounts if data is available, use key to re-verify account;
    let _userAccount = accounts.find((account) => account.username === username);
    const _authType = _userAccount?.local?.authType;
    if (!_authType) {
      throw new Error('could not recover account data from redux copy');
    }

    // TODO: check if this need to accomodate HIVE_AUTH;
    if (_authType === AUTH_TYPE.STEEM_CONNECT) {
      const _scAccount = await getSCAccount(username);
      if (!_scAccount?.refreshToken) {
        throw new Error('refresh node not present');
      }
      _userAccount = await loginWithSC2(_scAccount.refreshToken);
      console.log('successfully repair hive signer based account data', username);
    }

    // TOOD: handle hive auth account repair
    else if (_authType === AUTH_TYPE.HIVE_AUTH) {
      // get SC data
      // make sure tokens are not already expired
      // repair data
      // if already expired, prompt for relogin
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

    // compile authData for return;
    authData = [_userAccount.local];
  } catch (err) {
    // keys data corrupted, ask user to verify login
    await delay(500);

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
                params: { username },
              });
            },
          },
        ],
      },
    });
  }

  return authData;
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

export const migrateSelectedTokens = (tokens: any) => {
  if (!isArray(tokens)) {
    // means tokens is using old object formation, covert to array
    const _mapSymbolsToProfileToken = (symbols: string[], type: TokenType) =>
      isArray(symbols)
        ? symbols.map((symbol) => ({
            symbol,
            type,
            meta: { show: true },
          }))
        : [];

    return [
      ..._mapSymbolsToProfileToken(tokens.engine, TokenType.ENGINE),
      ..._mapSymbolsToProfileToken(tokens.spk, TokenType.SPK),
    ];
  }

  // check for missing meta entries
  else if (tokens.some((item: ProfileToken) => !item.meta)) {
    // unify tokens to have meta and discard duplicate entries

    const map = new Map();

    tokens.forEach((token: ProfileToken) => {
      const key = `${token.symbol}-${token.type}`;
      const existing = map.get(key);

      // If no existing entry, or existing entry has no meta but current has meta, update
      if (!existing || (!existing.meta && token.meta)) {
        map.set(key, token);
      }
    });

    // Add meta:{show:true} to entries missing meta
    const _tokens = Array.from(map.values()).map((token) => {
      if (!token.meta) {
        return { ...token, meta: { show: true } };
      }
      return token;
    });

    return _tokens;
  }

  return null;
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
  6: (state) => {
    state.application.waveUpvotePercent = state.application.commentUpvotePercent;
    return state;
  },
  7: (state) => {
    state.cache.announcementsMeta = {};
    return state;
  },
  8: (state) => {
    state.cache.pollVotesCollection = {};
    return state;
  },
  9: (state) => {
    state.editor.pollDraftsMap = {};
    return state;
  },
  10: (state) => {
    state.customTabs.mainTabs = DEFAULT_FEED_FILTERS;
    return state;
  },
  11: (state) => {
    state.cache.proposalsVoteMeta = {};
    return state;
  },
  12: (state) => {
    state.application.pin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
    return state;
  },
  13: (state) => {
    state.wallet.selectedAssets = state.wallet.selectedCoins || DEFAULT_ASSETS;
    if ((state.wallet.selectedAssets[0].symbol = 'POINTS')) {
      state.wallet.selectedAssets[0].symbol = 'POINTS';
    } // ensuring correct symbol for ecency points

    delete state.wallet.selectedCoins;
    delete state.wallet.coinsData;

    return state;
  },
};

export default {
  migrateSettings,
  migrateUserEncryption,
  migrateSelectedTokens,
  reduxMigrations,
};
