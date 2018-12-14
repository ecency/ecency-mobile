import Realm from 'realm';

// CONSTANTS
const USER_SCHEMA = 'user';
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
    language: { type: 'string', default: null },
    isDarkTheme: { type: 'bool', default: false },
    currency: { type: 'string', default: null },
    notification: { type: 'bool', default: true },
    server: { type: 'string', default: null },
    upvotePercent: { type: 'string', default: null },
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
  schema: [userSchema, authSchema, draftSchema, settingsSchema, applicationSchema],
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
    });
  });
}

// TODO: This is getting ALL user data, we should change this method with getUserDataWithUsername
export const getUserData = () => new Promise((resolve, reject) => {
  try {
    const user = Array.from(realm.objects(USER_SCHEMA));
    resolve(user);
  } catch (error) {
    reject(error);
  }
});

export const getSelectedUser = username => new Promise((resolve, reject) => {
  try {
    const user = realm.objects(USER_SCHEMA).filtered('username = $0', username);
    resolve(user);
  } catch (error) {
    reject(error);
  }
});

export const getUserDataWithUsername = (username) => {
  try {
    const user = Array.from(realm.objects(USER_SCHEMA).filtered('username = $0', username));
    return user;
  } catch (error) {
    return error;
  }
};

export const setUserData = userData => new Promise((resolve, reject) => {
  try {
    const account = getUserDataWithUsername(userData.username);

    if (account.length === 0) {
      realm.write(() => {
        realm.create(userSchema.name, userData);
        resolve(userData);
      });
    } else {
      resolve(userData);
    }
  } catch (error) {
    reject(error);
  }
});

export const updateUserData = userData => new Promise((resolve, reject) => {
  try {
    const account = realm.objects(USER_SCHEMA).filtered('username = $0', userData.username);

    if (Array.from(account).length > 0) {
      realm.write(() => {
        account[0].masterKey = userData.masterKey;
        account[0].activeKey = userData.activeKey;
        account[0].memoKey = userData.memoKey;
        account[0].postingKey = userData.postingKey;
        account[0].accessToken = userData.accessToken || '';
        resolve(userData);
      });
    } else {
      reject('User not found');
    }
  } catch (error) {
    reject(error);
  }
});

export const removeUserData = username => new Promise((resolve, reject) => {
  try {
    const account = realm.objects(USER_SCHEMA).filtered('username = $0', username);

    if (Array.from(account).length > 0) {
      realm.write(() => {
        realm.delete(account);
        resolve();
      });

    } else {
      reject('Could not remove selected user');
    }
  } catch (error) {
    reject(error);
  }
});

// // TODO: This method deleting ALL users. This should delete just a user.
// export const removeUserData = () => new Promise((resolve, reject) => {
//   setAuthStatus({ isLoggedIn: false }).then(() => {
//     try {
//       const accounts = realm.objects(USER_SCHEMA);
//       realm.write(() => {
//         realm.delete(accounts);
//       });
//       resolve();
//     } catch (error) {
//       alert(error);
//       reject(error);
//     }
//   });
// });

export const setDraftPost = (fields, username) => new Promise((resolve, reject) => {
  try {
    const draft = realm.objects(DRAFT_SCHEMA).filtered('username = $0', username);

    realm.write(() => {
      if (Array.from(draft).length > 0) {
        draft[0].title = fields.title;
        draft[0].tags = fields.tags;
        draft[0].body = fields.body;
        resolve(true);
      } else {
        realm.create(DRAFT_SCHEMA, {
          username,
          title: fields.title,
          tags: fields.tags,
          body: fields.body,
        });
        resolve(true);
      }
    });
  } catch (error) {
    reject(error);
  }
});

export const getDraftPost = username => new Promise((resolve, reject) => {
  try {
    const draft = Array.from(realm.objects(DRAFT_SCHEMA).filtered('username = $0', username));
    resolve(draft[0]);
  } catch (error) {
    reject(error);
  }
});

export const getAuthStatus = () => new Promise((resolve, reject) => {
  try {
    const auth = realm.objects(AUTH_SCHEMA);
    if (auth['0']) {
      resolve(auth['0']);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const setAuthStatus = authStatus => new Promise((resolve, reject) => {
  try {
    const auth = realm.objects(AUTH_SCHEMA);
    realm.write(() => {
      if (Array.from(auth).length > 0) {
        auth[0].isLoggedIn = authStatus.isLoggedIn;
        resolve(auth[0]);
      } else {
        realm.create(AUTH_SCHEMA, { ...authStatus, pinCode: '' });
        resolve(authStatus);
      }
    });
  } catch (error) {
    reject(error);
  }
});

export const updateCurrentUsername = username => new Promise((resolve, reject) => {
  try {
    const auth = realm.objects(AUTH_SCHEMA);
    realm.write(() => {
      if (Array.from(auth).length > 0) {
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

export const setPinCode = pinCode => new Promise((resolve, reject) => {
  try {
    const auth = realm.objects(AUTH_SCHEMA);

    realm.write(() => {
      auth[0].pinCode = pinCode;
      resolve(auth[0]);
    });
  } catch (error) {
    reject(error);
  }
});

export const getPinCode = () => new Promise((resolve, reject) => {
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

export const setTheme = isDarkTheme => new Promise((resolve, reject) => {
  try {
    realm.write(() => {
      settings[0].isDarkTheme = isDarkTheme;
      resolve(true);
    });
  } catch (error) {
    reject(error);
  }
});

export const setUpvotePercent = percent => new Promise((resolve, reject) => {
  try {
    realm.write(() => {
      settings[0].upvotePercent = percent;
      resolve(true);
    });
  } catch (error) {
    reject(error);
  }
});

export const getUpvotePercent = () => new Promise((resolve, reject) => {
  try {
    if (settings[0]) {
      resolve(settings[0].upvotePercent);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const getTheme = () => new Promise((resolve, reject) => {
  try {
    if (settings[0]) {
      resolve(settings[0].isDarkTheme);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const setLanguage = selectedLanguage => new Promise((resolve, reject) => {
  try {
    realm.write(() => {
      settings[0].language = selectedLanguage;
      resolve(true);
    });
  } catch (error) {
    reject(error);
  }
});

export const setServer = selectedServer => new Promise((resolve, reject) => {
  try {
    realm.write(() => {
      settings[0].server = selectedServer;
      resolve(true);
    });
  } catch (error) {
    reject(error);
  }
});

export const setNotificationIsOpen = notificationIsOpen => new Promise((resolve, reject) => {
  try {
    realm.write(() => {
      settings[0].notification = notificationIsOpen;
      resolve(true);
    });
  } catch (error) {
    reject(error);
  }
});

export const setCurrency = selectedCurrency => new Promise((resolve, reject) => {
  try {
    realm.write(() => {
      settings[0].curreny = selectedCurrency;
      resolve(true);
    });
  } catch (error) {
    reject(error);
  }
});

export const getLanguage = () => new Promise((resolve, reject) => {
  try {
    if (settings[0]) {
      resolve(settings[0].language);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const getServer = () => new Promise((resolve, reject) => {
  try {
    if (settings[0]) {
      resolve(settings[0].server);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const getSettings = () => new Promise((resolve, reject) => {
  try {
    if (settings[0]) {
      resolve(settings[0]);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const getPushTokenSaved = () => new Promise((resolve, reject) => {
  try {
    const application = realm.objects(APPLICATION_SCHEMA);
    if (!application[0]) {
      setPushTokenSaved(false);
      resolve(false);
    }
    if (application[0].isPushTokenSaved) {
      resolve(application[0].isPushTokenSaved);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const setPushTokenSaved = pushTokenSaved => new Promise((resolve, reject) => {
  try {
    const application = realm.objects(APPLICATION_SCHEMA);
    realm.write(() => {
      if (Array.from(application).length > 0) {
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

export const getExistUser = () => new Promise((resolve, reject) => {
  try {
    const application = realm.objects(APPLICATION_SCHEMA);
    if (!application[0]) {
      setExistUser(false);
      resolve(false);
    }
    if (application[0].isExistUser) {
      resolve(application[0].isExistUser);
    } else {
      resolve(false);
    }
  } catch (error) {
    reject(error);
  }
});

export const setExistUser = existUser => new Promise((resolve, reject) => {
  try {
    const application = realm.objects(APPLICATION_SCHEMA);
    realm.write(() => {
      if (Array.from(application).length > 0) {
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
