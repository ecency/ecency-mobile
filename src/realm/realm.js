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
      AsyncStorage.setItem(USER_SCHEMA, JSON.stringify(users));
      const scAccount = convertToArray(realm.objects(SC_ACCOUNTS));
      AsyncStorage.setItem(SC_ACCOUNTS, JSON.stringify(scAccount));
      const auth =
        convertToArray(realm.objects(AUTH_SCHEMA)).length === 1
          ? convertToArray(realm.objects(AUTH_SCHEMA))[0]
          : convertToArray(realm.objects(AUTH_SCHEMA));
      AsyncStorage.setItem(AUTH_SCHEMA, JSON.stringify(auth));
      const draft = convertToArray(realm.objects(DRAFT_SCHEMA));
      AsyncStorage.setItem(DRAFT_SCHEMA, JSON.stringify(draft));
      const setting =
        convertToArray(realm.objects(SETTINGS_SCHEMA)).length === 1
          ? convertToArray(realm.objects(SETTINGS_SCHEMA))[0]
          : convertToArray(realm.objects(SETTINGS_SCHEMA));
      AsyncStorage.setItem(SETTINGS_SCHEMA, JSON.stringify(setting));
      const application =
        convertToArray(realm.objects(APPLICATION_SCHEMA)).length === 1
          ? convertToArray(realm.objects(APPLICATION_SCHEMA))[0]
          : convertToArray(realm.objects(APPLICATION_SCHEMA));
      AsyncStorage.setItem(APPLICATION_SCHEMA, JSON.stringify(application));
    }

    // AsyncStorage.setItem('temp-reply', '');
    // AsyncStorage.getItem('temp-reply');
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
  console.log('userData 111 :', userData);
  try {
    const account = getUserDataWithUsername(userData.username);

    if (account.length === 0) {
      account.push(userData);
      await setItemToStorage(USER_SCHEMA, account);
    }
    return userData;
  } catch (error) {
    return error;
  }
};

export const updateUserData = async userData => {
  console.log('userData 222 :', userData);
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
    console.log('account :', account);

    if (account.some(e => e.username === username)) {
      account = account.filter(item => item.username !== username);
      console.log('account :', account);
      await setItemToStorage(USER_SCHEMA, account);
      console.log('return :');
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

export const updateCurrentUsername = username =>
  new Promise((resolve, reject) => {
    try {
      const auth = realm.objects(AUTH_SCHEMA);
      realm.write(() => {
        if (convertToArray(auth).length > 0) {
          auth[0].currentUsername = username;
          resolve(auth[0]);
        } else {
          const authData = {
            isLoggedIn: false,
            pinCode: '',
            currentUsername: username,
          };
          realm.create(AUTH_SCHEMA, { ...authData });
          resolve(authData);
        }
      });
    } catch (error) {
      reject(error);
    }
  });

export const setPinCode = pinCode =>
  new Promise((resolve, reject) => {
    try {
      const auth = realm.objects(AUTH_SCHEMA);
      const pinHash = sha256(pinCode);

      realm.write(() => {
        auth[0].pinCode = pinHash.toString();
        resolve(auth[0]);
      });
    } catch (error) {
      reject(error);
    }
  });

export const removePinCode = () =>
  new Promise((resolve, reject) => {
    try {
      const auth = realm.objects(AUTH_SCHEMA);

      realm.write(() => {
        auth[0].pinCode = '';
        resolve(auth[0]);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getPinCode = () =>
  new Promise((resolve, reject) => {
    try {
      const auth = realm.objects(AUTH_SCHEMA);
      if (auth[0]) {
        resolve(auth[0].pinCode);
      }
    } catch (error) {
      reject(error);
    }
  });

// SETTINGS

export const getPinCodeOpen = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting[0]) {
      return setting[0].isPinCodeOpen;
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const setPinCodeOpen = status =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].isPinCodeOpen = status;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const setTheme = isDarkTheme =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].isDarkTheme = isDarkTheme;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getTheme = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting[0]) {
      return setting[0].isDarkTheme;
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const setDefaultFooter = isDefaultFooter =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].isDefaultFooter = isDefaultFooter;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const setUpvotePercent = percent =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].upvotePercent = percent;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getUpvotePercent = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting[0]) {
      return setting[0].upvotePercent;
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const getNsfw = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting[0]) {
      return setting[0].nsfw;
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const setNsfw = nsfw =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].nsfw = nsfw;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const setLanguage = selectedLanguage =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].language = selectedLanguage;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const setServer = selectedServer =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].server = selectedServer;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const setNotificationSettings = ({ type, action }) =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        switch (type) {
          case 'notification.follow':
            settings[0].followNotification = action;
            break;
          case 'notification.vote':
            settings[0].voteNotification = action;
            break;
          case 'notification.comment':
            settings[0].commentNotification = action;
            break;
          case 'notification.mention':
            settings[0].mentionNotification = action;
            break;
          case 'notification.reblog':
            settings[0].reblogNotification = action;
            break;
          case 'notification.transfers':
            settings[0].transfersNotification = action;
            break;
          case 'notification':
            settings[0].notification = action;
            break;
          default:
            break;
        }
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const setCurrency = currencyProps =>
  new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        settings[0].currency = currencyProps;
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getLanguage = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting[0]) {
      return setting[0].language;
    }
    return false;
  } catch (error) {
    return error;
  }
};

export const getServer = async () => {
  try {
    const setting = await getItemFromStorage(SETTINGS_SCHEMA);
    if (setting[0]) {
      return setting[0].server;
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

export const setPushTokenSaved = pushTokenSaved =>
  new Promise((resolve, reject) => {
    try {
      const application = realm.objects(APPLICATION_SCHEMA);
      realm.write(() => {
        if (convertToArray(application).length > 0) {
          application[0].isPushTokenSaved = pushTokenSaved;
          resolve(application[0]);
        } else {
          const applicationData = {
            pushTokenSaved: false,
          };
          realm.create(APPLICATION_SCHEMA, { ...applicationData });
          resolve(applicationData);
        }
      });
    } catch (error) {
      reject(error);
    }
  });

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

export const setExistUser = existUser =>
  new Promise((resolve, reject) => {
    try {
      const application = realm.objects(APPLICATION_SCHEMA);
      realm.write(() => {
        if (convertToArray(application).length > 0) {
          application[0].isExistUser = existUser;
          resolve(application[0]);
        } else {
          const applicationData = {
            existUser: false,
          };
          realm.create(APPLICATION_SCHEMA, { ...applicationData });
          resolve(applicationData);
        }
      });
    } catch (error) {
      reject(error);
    }
  });

export const setSCAccount = data =>
  new Promise((resolve, reject) => {
    try {
      const scAccount = realm.objects(SC_ACCOUNTS).filtered('username = $0', data.username);
      const date = new Date();
      date.setSeconds(date.getSeconds() + data.expires_in);
      realm.write(() => {
        if (convertToArray(scAccount).length > 0) {
          scAccount[0].refreshToken = data.refresh_token;
          scAccount[0].expireDate = date.toString();
          resolve();
        } else {
          const account = {
            username: data.username,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expireDate: date.toString(),
          };
          realm.create(SC_ACCOUNTS, { ...account });
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });

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

export const removeSCAccount = username =>
  new Promise((resolve, reject) => {
    try {
      const scAccount = realm.objects(SC_ACCOUNTS).filtered('username = $0', username);

      if (convertToArray(scAccount).length > 0) {
        realm.write(() => {
          realm.delete(scAccount);
          resolve();
        });
      } else {
        reject(new Error('Could not remove selected user'));
      }
    } catch (error) {
      reject(error);
    }
  });
