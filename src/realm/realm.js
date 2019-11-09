import Realm from 'realm';
import sha256 from 'crypto-js/sha256';
import { AsyncStorage } from 'react-native';

// CONSTANTS
const USER_SCHEMA = 'user';
const SC_ACCOUNTS = 'sc_accounts';
const AUTH_SCHEMA = 'auth';
const DRAFT_SCHEMA = 'draft';
const SETTINGS_SCHEMA = 'settings';
const APPLICATION_SCHEMA = 'application';
const STORAGE_SCHEMA = 'storage';

const userSchema = {
  name: USER_SCHEMA,
  properties: {
    username: { type: 'string' },
    avatar: { type: 'string' },
    authType: { type: 'string' },
    postingKey: { type: 'string' },
    activeKey: { type: 'string' },
    memoKey: { type: 'string' },
    masterKey: { type: 'string' },
    accessToken: { type: 'string' },
  },
};

const scAccounts = {
  name: SC_ACCOUNTS,
  properties: {
    username: { type: 'string', default: null },
    refreshToken: { type: 'string', default: null },
    expireDate: { type: 'string', default: null },
  },
};

const draftSchema = {
  name: DRAFT_SCHEMA,
  properties: {
    title: { type: 'string' },
    tags: { type: 'string' },
    body: { type: 'string' },
    username: { type: 'string' },
  },
};

const settingsSchema = {
  name: SETTINGS_SCHEMA,
  properties: {
    currency: { type: 'string', default: null },
    isDarkTheme: { type: 'bool', default: false },
    isPinCodeOpen: { type: 'bool', default: true },
    isDefaultFooter: { type: 'bool', default: true },
    language: { type: 'string', default: null },
    notification: { type: 'bool', default: true },
    nsfw: { type: 'string', default: null },
    server: { type: 'string', default: null },
    upvotePercent: { type: 'string', default: null },
    followNotification: { type: 'bool', default: true },
    voteNotification: { type: 'bool', default: true },
    commentNotification: { type: 'bool', default: true },
    mentionNotification: { type: 'bool', default: true },
    reblogNotification: { type: 'bool', default: true },
    transfersNotification: { type: 'bool', default: true },
  },
};

const applicationSchema = {
  name: APPLICATION_SCHEMA,
  properties: {
    isPushTokenSaved: { type: 'bool', default: false },
    isExistUser: { type: 'bool', default: false },
  },
};

const authSchema = {
  name: AUTH_SCHEMA,
  properties: {
    isLoggedIn: { type: 'bool', default: false },
    pinCode: { type: 'string' },
    currentUsername: { type: 'string' },
  },
};

const realm = new Realm({
  path: 'esteem.realm',
  schema: [userSchema, authSchema, draftSchema, settingsSchema, applicationSchema, scAccounts],
  schemaVersion: 3,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 3 && newRealm.schemaVersion > 2) {
      const newObjects = newRealm.objects(SETTINGS_SCHEMA);
      newObjects[0].isPinCodeOpen = true;
    }
  },
});

const settings = realm.objects(SETTINGS_SCHEMA);

if (Array.from(settings).length <= 0) {
  realm.write(() => {
    realm.create(SETTINGS_SCHEMA, {
      language: '',
      isDarkTheme: false,
      currency: '',
      notification: true,
      server: '',
      upvotePercent: '1',
      nsfw: '0',
      followNotification: true,
      voteNotification: true,
      commentNotification: true,
      mentionNotification: true,
      reblogNotification: true,
      transfersNotification: true,
    });
  });
}

export const convertToArray = realmObjectsArray => {
  const copyOfJsonArray = Array.from(realmObjectsArray);
  const jsonArray = JSON.parse(JSON.stringify(copyOfJsonArray));
  return jsonArray;
};

export const getItemFromStorage = async key => {
  const data = await AsyncStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const setItemToStorage = async (key, data) => {
  if (data) {
    const dataStr = JSON.stringify(data);
    await AsyncStorage.setItem(key, dataStr);
    return true;
  }
  return false;
};

export const getAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    const isMigrated = [
      USER_SCHEMA,
      SC_ACCOUNTS,
      AUTH_SCHEMA,
      DRAFT_SCHEMA,
      SETTINGS_SCHEMA,
      APPLICATION_SCHEMA,
    ].some(el => keys.includes(el));
    if (!isMigrated) {
      const users = convertToArray(realm.objects(USER_SCHEMA));
      const scAccount = convertToArray(realm.objects(SC_ACCOUNTS));
      const draft = convertToArray(realm.objects(DRAFT_SCHEMA));
      const auth =
        convertToArray(realm.objects(AUTH_SCHEMA)).length === 1
          ? convertToArray(realm.objects(AUTH_SCHEMA))[0]
          : convertToArray(realm.objects(AUTH_SCHEMA));
      const setting =
        convertToArray(realm.objects(SETTINGS_SCHEMA)).length === 1
          ? convertToArray(realm.objects(SETTINGS_SCHEMA))[0]
          : convertToArray(realm.objects(SETTINGS_SCHEMA));
      const application =
        convertToArray(realm.objects(APPLICATION_SCHEMA)).length === 1
          ? convertToArray(realm.objects(APPLICATION_SCHEMA))[0]
          : convertToArray(realm.objects(APPLICATION_SCHEMA));

      const data = [
        [USER_SCHEMA, JSON.stringify(users)],
        [SC_ACCOUNTS, JSON.stringify(scAccount)],
        [AUTH_SCHEMA, JSON.stringify(auth)],
        [DRAFT_SCHEMA, JSON.stringify(draft)],
        [SETTINGS_SCHEMA, JSON.stringify(setting)],
        [APPLICATION_SCHEMA, JSON.stringify(application)],
        [STORAGE_SCHEMA, 'A'],
      ];
      AsyncStorage.multiSet(data);
    }
  } catch (error) {
    return error;
  }
};

getAllData();

// TODO: This is getting ALL user data, we should change this method with getUserDataWithUsername
export const getUserData = async () => {
  try {
    const user = await getItemFromStorage(USER_SCHEMA);
    return user;
  } catch (error) {
    return error;
  }
};

export const getUserDataWithUsername = async username => {
  try {
    const user = await getItemFromStorage(USER_SCHEMA);
    const userObj = user.filter(u => u.username === username);
    return userObj;
  } catch (error) {
    return error;
  }
};

export const setUserData = async userData => {
  try {
    const account = await getUserDataWithUsername(userData.username);
    const user = await getItemFromStorage(USER_SCHEMA);

    if (account.length === 0) {
      user.push(userData);
      await setItemToStorage(USER_SCHEMA, user);
    }
    return userData;
  } catch (error) {
    return error;
  }
};

export const updateUserData = async userData => {
  try {
    let account = await getItemFromStorage(USER_SCHEMA);

    if (account.some(e => e.username === userData.username)) {
      account = account.map(item =>
        item.username === userData.username ? { ...item, ...userData } : item,
      );
      await setItemToStorage(USER_SCHEMA, account);
      return true;
    }
    return 'User not found';
  } catch (error) {
    return error;
  }
};

export const removeUserData = async username => {
  try {
    let account = await getItemFromStorage(USER_SCHEMA);

    if (account.some(e => e.username === username)) {
      account = account.filter(item => item.username !== username);
      await setItemToStorage(USER_SCHEMA, account);
      return true;
    }
    return new Error('Could not remove selected user');
  } catch (error) {
    return error;
  }
};

export const removeAllUserData = async () => {
  try {
    await setItemToStorage(USER_SCHEMA, []);
    await setItemToStorage(SC_ACCOUNTS, []);
    return true;
  } catch (error) {
    return error;
  }
};

export const setDraftPost = async (fields, username) => {
  try {
    let draft = await getItemFromStorage(DRAFT_SCHEMA);

    const data = {
      username,
      title: fields.title,
      tags: fields.tags,
      body: fields.body,
    };

    if (draft.some(e => e.username === username)) {
      draft = draft.map(item => (item.username === username ? { ...item, ...data } : item));
    } else {
      draft.push(data);
    }
    await setItemToStorage(DRAFT_SCHEMA, draft);
    return true;
  } catch (error) {
    return error;
  }
};

export const getDraftPost = async username => {
  try {
    const draft = await getItemFromStorage(DRAFT_SCHEMA);
    const draftObj = draft.filter(item => item.username === username);
    return draftObj[0];
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};

export const setAuthStatus = async authStatus => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);
    if (auth) {
      auth.isLoggedIn = authStatus.isLoggedIn;
      await setItemToStorage(AUTH_SCHEMA, auth);
      return auth;
    }
    await setItemToStorage(AUTH_SCHEMA, { ...authStatus, pinCode: '' });
    return authStatus;
  } catch (error) {
    return error;
  }
};

export const updateCurrentUsername = async username => {
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
  } catch (error) {
    return error;
  }
};

export const setPinCode = async pinCode => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);
    const pinHash = sha256(pinCode);

    auth.pinCode = pinHash.toString();
    await setItemToStorage(AUTH_SCHEMA, auth);

    return auth;
  } catch (error) {
    return error;
  }
};

export const removePinCode = async () => {
  try {
    const auth = await getItemFromStorage(AUTH_SCHEMA);

    auth.pinCode = '';
    await setItemToStorage(AUTH_SCHEMA, auth);

    return auth;
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};

export const setPinCodeOpen = async status => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.isPinCodeOpen = status;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const setTheme = async isDarkTheme => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.isDarkTheme = isDarkTheme;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const getTheme = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.isDarkTheme;
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const setDefaultFooter = async isDefaultFooter => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.isDefaultFooter = isDefaultFooter;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const setUpvotePercent = async percent => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.upvotePercent = percent;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const getUpvotePercent = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting) {
      return setting.upvotePercent;
    }
    return false;
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};

export const setNsfw = async nsfw => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.nsfw = nsfw;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const setLanguage = async selectedLanguage => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.language = selectedLanguage;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const setServer = async selectedServer => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.server = selectedServer;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
    return error;
  }
};

export const setNotificationSettings = async ({ type, action }) => {
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
  } catch (error) {
    return error;
  }
};

export const setCurrency = async currencyProps => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    setting.currency = currencyProps;
    await setItemToStorage(SETTINGS_SCHEMA, setting);

    return true;
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};

export const getSettings = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);

    if (setting) {
      return setting;
    }
    return false;
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};

export const setPushTokenSaved = async pushTokenSaved => {
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
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};

export const setExistUser = async existUser => {
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
  } catch (error) {
    return error;
  }
};

export const setSCAccount = async data => {
  try {
    let scAccount = await getItemFromStorage(SC_ACCOUNTS);
    const date = new Date();
    date.setSeconds(date.getSeconds() + data.expires_in);
    if (scAccount.some(e => e.username === data.username)) {
      scAccount = scAccount.map(item =>
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
  } catch (error) {
    return error;
  }
};

export const getSCAccount = async username => {
  try {
    const scAccountStr = await getItemFromStorage(SC_ACCOUNTS);
    const scAccount = scAccountStr.filter(u => u.username === username);
    if (convertToArray(scAccount).length > 0) {
      return scAccount[0];
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const removeSCAccount = async username => {
  try {
    let scAccount = await getItemFromStorage(SC_ACCOUNTS);

    if (scAccount.some(e => e.username === username)) {
      scAccount = scAccount.filter(item => item.username !== username);

      await setItemToStorage(SC_ACCOUNTS, scAccount);

      return true;
    }
    return new Error('Could not remove selected user');
  } catch (error) {
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
  } catch (error) {
    return error;
  }
};
