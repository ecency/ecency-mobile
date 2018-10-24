import Realm from 'realm';

// CONSTANTS
const USER_SCHEMA = 'user';
const AUTH_SCHEMA = 'auth';

const userSchema = {
  name: USER_SCHEMA,
  properties: {
    username: { type: 'string' },
    authType: { type: 'string' },
    postingKey: { type: 'string' },
    activeKey: { type: 'string' },
    memoKey: { type: 'string' },
    masterKey: { type: 'string' },
    accessToken: { type: 'string' },
  },
};

const authSchema = {
  name: AUTH_SCHEMA,
  properties: {
    isLoggedIn: { type: 'bool', default: false },
  },
};

const realm = new Realm({ schema: [userSchema, authSchema] });

// TODO: This is getting ALL user data, we should change this method with getUserDataWithUsername
export const getUserData = () => new Promise((resolve, reject) => {
  try {
    const user = realm.objects(USER_SCHEMA);
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
        resolve(userData);
      });
    } else {
      reject('User not found');
    }
  } catch (error) {
    reject(error);
  }
});

// TODO: This method deleting ALL users. This should delete just a user.
export const removeUserData = () => new Promise((resolve, reject) => {
  setAuthStatus({ isLoggedIn: false }).then(() => {
    try {
      const accounts = realm.objects(USER_SCHEMA);
      realm.write(() => {
        realm.delete(accounts);
      });
      resolve();
    } catch (error) {
      alert(error);
      reject(error);
    }
  });
});

export const getAuthStatus = () => new Promise((resolve, reject) => {
  try {
    const auth = realm.objects(AUTH_SCHEMA);
    if (auth['0']) {
      resolve(auth['0'].isLoggedIn);
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
      realm.delete(auth);
      realm.create(AUTH_SCHEMA, authStatus);
      resolve(authStatus);
    });
  } catch (error) {
    reject(error);
  }
});
