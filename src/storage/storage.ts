import sha256 from 'crypto-js/sha256';
import AsyncStorage from '@react-native-async-storage/async-storage';
import parseVersionNumber from '../utils/parseVersionNumber';

// CONSTANTS
const USER_SCHEMA = 'user';
const SC_ACCOUNTS = 'sc_accounts';
const AUTH_SCHEMA = 'auth';
const DRAFT_SCHEMA = 'draft';
const SETTINGS_SCHEMA = 'settings';
const CACHE_SCHEMA = 'cache';
const APPLICATION_SCHEMA = 'application';
const STORAGE_SCHEMA = 'storage';

export const getItemFromStorage = async (key: string) => {
  const data = await AsyncStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const setItemToStorage = async (key: string, data: any) => {
  if (data) {
    const dataStr = JSON.stringify(data);
    await AsyncStorage.setItem(key, dataStr);
    return true;
  }
  return false;
};

// TODO: This is getting ALL user data, we should change this method with getUserDataWithUsername
export const getUserData = async () => {
  try {
    const user = await getItemFromStorage(USER_SCHEMA);
    return user;
  } catch (error: any) {
    return error;
  }
};

export const getUserDataWithUsername = async (username: string) => {
  try {
    const user = await getItemFromStorage(USER_SCHEMA);
    if (user) {
      const userObj = user.filter((u: any) => u.username === username);
      return userObj;
    }
    return [];
  } catch (error: any) {
    console.warn('Failed to get user data: ', error);
    return error;
  }
};

export const setUserData = async (userData: any) => {
  try {
    const users = (await getItemFromStorage(USER_SCHEMA)) || [];

    // replace user data if exist already else add new
    const filteredUsers = users.filter((account: any) => account.username !== userData.username);
    const _newData = [...filteredUsers, userData];

    await setItemToStorage(USER_SCHEMA, _newData);

    return userData;
  } catch (error: any) {
    return error;
  }
};

export const updateUserData = async (userData: any) => {
  try {
    let account = await getItemFromStorage(USER_SCHEMA);

    if (account.some((e: any) => e.username === userData.username)) {
      account = account.map((item: any) =>
        item.username === userData.username ? { ...item, ...userData } : item,
      );
      await setItemToStorage(USER_SCHEMA, account);
      return true;
    }
    return 'User not found';
  } catch (error: any) {
    return error;
  }
};

export const removeUserData = async (username: string) => {
  try {
    let account = await getItemFromStorage(USER_SCHEMA);

    if (account.some((e: any) => e.username === username)) {
      account = account.filter((item: any) => item.username !== username);
      await setItemToStorage(USER_SCHEMA, account);
    }

    return true;
  } catch (error: any) {
    return error;
  }
};

export const removeAllUserData = async () => {
  try {
    await setItemToStorage(USER_SCHEMA, []);
    await setItemToStorage(SC_ACCOUNTS, []);
    return true;
  } catch (error: any) {
    return error;
  }
};

export const removeAllSCAccounts = async () => {
  try {
    await setItemToStorage(SC_ACCOUNTS, []);
    return true;
  } catch (error: any) {
    return error;
  }
};

export const setDraftPost = async (fields: any, username: string, draftId?: string) => {
  try {
    let draft = await getItemFromStorage(DRAFT_SCHEMA);
    const timestamp = new Date().getTime();

    const data = {
      username,
      draftId,
      timestamp: fields.timestamp === 0 ? 0 : timestamp,
      title: fields.title,
      tags: fields.tags,
      body: fields.body,
    };

    if (draft && draft.some((e: any) => e.username === username)) {
      // check if entry esist
      const draftIndex = draft.findIndex(
        (item: any) => draftId === undefined || item.draftId === draftId,
      );

      if (draftIndex < 0) {
        draft.push(data);
      } else {
        draft[draftIndex] = data;
      }
    } else {
      draft = [];
      draft.push(data);
    }
    await setItemToStorage(DRAFT_SCHEMA, draft);
    return true;
  } catch (error: any) {
    return error;
  }
};

export const getDraftPost = async (username: string, draftId?: string) => {
  try {
    const draft = await getItemFromStorage(DRAFT_SCHEMA);
    const draftObj = draft.filter(
      (item: any) =>
        item.username === username && (draftId === undefined || item.draftId === draftId),
    );

    return draftObj[0];
  } catch (error: any) {
    return error;
  }
};

export const getAuthStatus = async () => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);
    if (auth) {
      return auth;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const setAuthStatus = async (authStatus: any) => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);
    if (auth) {
      auth.isLoggedIn = authStatus.isLoggedIn;
      await setItemToStorage(AUTH_SCHEMA, auth);
      return auth;
    }
    await setItemToStorage(AUTH_SCHEMA, { ...authStatus, pinCode: '' });
    return authStatus;
  } catch (error: any) {
    return error;
  }
};

export const updateCurrentUsername = async (username: string) => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);

    if (auth) {
      auth.currentUsername = username;
      await setItemToStorage(AUTH_SCHEMA, auth);
      return auth;
    }
    const authData = {
      isLoggedIn: false,
      pinCode: '',
      currentUsername: username,
    };

    await setItemToStorage(AUTH_SCHEMA, { ...authData });
    return authData;
  } catch (error: any) {
    return error;
  }
};

export const setPinCode = async (pinCode: string) => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);
    const pinHash = sha256(pinCode);

    auth.pinCode = pinHash.toString();
    await setItemToStorage(AUTH_SCHEMA, auth);

    return auth;
  } catch (error: any) {
    return error;
  }
};

export const removePinCode = async () => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);

    auth.pinCode = '';
    await setItemToStorage(AUTH_SCHEMA, auth);

    return auth;
  } catch (error: any) {
    return error;
  }
};

export const getPinCode = async () => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);

    if (auth) {
      return auth.pinCode;
    }
    return '';
  } catch (error: any) {
    console.warn('Failed get auth from storage: ', error);
    return error;
  }
};

// SETTINGS

export const getPinCodeOpen = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.isPinCodeOpen;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const setPinCodeOpen = async (status: boolean) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.isPinCodeOpen = status;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const getLastUpdateCheck = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.lastUpdateCheck;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const setLastUpdateCheck = async (lastUpdateCheck: any) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.lastUpdateCheck = lastUpdateCheck;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const setDefaultFooter = async (isDefaultFooter: boolean) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.isDefaultFooter = isDefaultFooter;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const getNsfw = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.nsfw;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const setNsfw = async (nsfw: string) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.nsfw = nsfw;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const setLanguage = async (selectedLanguage: string) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.language = selectedLanguage;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const setServer = async (selectedServer: string) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.server = selectedServer;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const setNotificationSettings = async ({
  type,
  action,
}: {
  type: string;
  action: boolean;
}) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    switch (type) {
      case 'notification.follow':
        setting.followNotification = action;
        break;
      case 'notification.vote':
        setting.voteNotification = action;
        break;
      case 'notification.comment':
        setting.commentNotification = action;
        break;
      case 'notification.mention':
        setting.mentionNotification = action;
        break;
      case 'notification.favorite':
        setting.favoriteNotification = action;
        break;
      case 'notification.tags':
        setting.tagsNotification = action;
        break;
      case 'notification.reblog':
        setting.reblogNotification = action;
        break;
      case 'notification.transfers':
        setting.transfersNotification = action;
        break;
      case 'notification':
        setting.notification = action;
        break;
      default:
        break;
    }

    await setItemToStorage(SETTINGS_SCHEMA, setting);
    return true;
  } catch (error: any) {
    return error;
  }
};

export const setCurrency = async (currencyProps: any) => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    setting.currency = currencyProps;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error: any) {
    return error;
  }
};

export const getCurrency = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.currency;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};
export const setCache = async (params: string, value: any) => {
  try {
    const cache = await getItemFromStorage(CACHE_SCHEMA);
    cache[params] = value;
    await setItemToStorage(CACHE_SCHEMA, cache);
    return true;
  } catch (error: any) {
    return error;
  }
};
export const getCache = async (params: string) => {
  try {
    const cache = await getItemFromStorage(CACHE_SCHEMA);
    if (cache && params) {
      return cache[params];
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const getLanguage = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.language;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const getServer = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.server;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const getSettings = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    if (setting) {
      return setting;
    }
    const settingData = {
      language: '',
      isDarkTheme: null,
      currency: '',
      notification: true,
      server: '',
      upvotePercent: '1',
      nsfw: '1',
      followNotification: true,
      voteNotification: true,
      commentNotification: true,
      mentionNotification: true,
      favoriteNotification: true,
      reblogNotification: true,
      transfersNotification: true,
      isPinCodeOpen: false,
      lastUpdateCheck: null,
    };
    await setItemToStorage(SETTINGS_SCHEMA, settingData);
    return settingData;
  } catch (error: any) {
    return error;
  }
};

export const getPushTokenSaved = async () => {
  try {
    const application = await getItemFromStorage(APPLICATION_SCHEMA);
    if (!application) {
      setPushTokenSaved(false);
      return false;
    }
    if (application.isPushTokenSaved) {
      return application.isPushTokenSaved;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const setPushTokenSaved = async (pushTokenSaved: boolean) => {
  try {
    const application = await getItemFromStorage(APPLICATION_SCHEMA);
    if (application) {
      application.isPushTokenSaved = pushTokenSaved;
      await setItemToStorage(APPLICATION_SCHEMA, application);
      return application;
    }
    const applicationData = {
      pushTokenSaved: false,
    };
    await setItemToStorage(APPLICATION_SCHEMA, { ...applicationData });
    return applicationData;
  } catch (error: any) {
    return error;
  }
};

export const getExistUser = async () => {
  try {
    const application = await getItemFromStorage(APPLICATION_SCHEMA);
    if (!application) {
      setExistUser(false);
      return false;
    }
    if (application.isExistUser) {
      return application.isExistUser;
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const setExistUser = async (existUser: boolean) => {
  try {
    const application = await getItemFromStorage(APPLICATION_SCHEMA);
    if (application) {
      application.isExistUser = existUser;
      await setItemToStorage(APPLICATION_SCHEMA, application);
      return application;
    }
    const applicationData = {
      existUser: false,
    };
    await setItemToStorage(APPLICATION_SCHEMA, { ...applicationData });
    return applicationData;
  } catch (error: any) {
    return error;
  }
};

export const setSCAccount = async (data: any) => {
  try {
    let scAccount = (await getItemFromStorage(SC_ACCOUNTS)) || [];
    const date = new Date();
    date.setSeconds(date.getSeconds() + data.expires_in);
    if (scAccount.some((e: any) => e.username === data.username)) {
      scAccount = scAccount.map((item: any) =>
        item.username === data.username
          ? { ...item, refreshToken: data.refresh_token, expireDate: date.toString() }
          : item,
      );
    } else {
      const account = {
        username: data.username,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expireDate: date.toString(),
      };
      scAccount.push(account);
    }
    await setItemToStorage(SC_ACCOUNTS, scAccount);
    return scAccount;
  } catch (error: any) {
    return error;
  }
};

export const getSCAccount = async (username: string) => {
  try {
    const scAccountStr = await getItemFromStorage(SC_ACCOUNTS);
    const scAccount = scAccountStr.filter((u: any) => u.username === username);
    if (scAccount.length > 0) {
      return scAccount[0];
    }
    return false;
  } catch (error: any) {
    return error;
  }
};

export const getAllSCAccounts = async () => {
  try {
    const scAccountStr = await getItemFromStorage(SC_ACCOUNTS);
    if (scAccountStr && scAccountStr.length > 0) {
      return scAccountStr;
    }
    return [];
  } catch (error: any) {
    return error;
  }
};

export const removeSCAccount = async (username: string) => {
  try {
    let scAccount = await getItemFromStorage(SC_ACCOUNTS);

    if (scAccount.some((e: any) => e.username === username)) {
      scAccount = scAccount.filter((item: any) => item.username !== username);

      await setItemToStorage(SC_ACCOUNTS, scAccount);

      return true;
    }
    return new Error('Could not remove selected user');
  } catch (error: any) {
    return error;
  }
};

export const getStorageType = async () => {
  try {
    const storageType = await AsyncStorage.getItem(STORAGE_SCHEMA);
    if (storageType !== null) {
      return storageType;
    }
    return 'R';
  } catch (error: any) {
    return error;
  }
};

export const getVersionForWelcomeModal = async () => {
  try {
    const application = await getItemFromStorage(APPLICATION_SCHEMA);
    if (application && application.versionForWelcomeModal) {
      return parseVersionNumber(application.versionForWelcomeModal);
    }
    return 0;
  } catch (error: any) {
    return error;
  }
};

export const setVersionForWelcomeModal = async (version: any) => {
  try {
    const application = await getItemFromStorage(APPLICATION_SCHEMA);
    if (application) {
      application.versionForWelcomeModal = version;
      await setItemToStorage(APPLICATION_SCHEMA, application);
      return application;
    }
    const applicationData = {
      versionForWelcomeModal: version,
    };
    await setItemToStorage(APPLICATION_SCHEMA, { ...applicationData });
    return applicationData;
  } catch (error: any) {
    return error;
  }
};
