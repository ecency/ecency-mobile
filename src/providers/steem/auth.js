import * as dsteem from 'dsteem';
import sha256 from 'crypto-js/sha256';
import Config from 'react-native-config';
import get from 'lodash/get';

import { getUser } from './dsteem';
import {
  setUserData,
  setAuthStatus,
  getUserDataWithUsername,
  updateUserData,
  updateCurrentUsername,
  getUserData,
  setSCAccount,
  getSCAccount,
  setPinCode,
  getPinCode,
} from '../../realm/realm';
import { encryptKey, decryptKey } from '../../utils/crypto';
import steemConnect from './steemConnectAPI';
import { getSCAccessToken } from '../esteem/esteem';

// Constants
import AUTH_TYPE from '../../constants/authType';

export const login = async (username, password, isPinCodeOpen) => {
  let loginFlag = false;
  let avatar = '';
  let authType = '';
  // Get user account data from STEEM Blockchain
  const account = await getUser(username);
  if (!account) {
    return Promise.reject(new Error('auth.invalid_username'));
  }
  if (await isLoggedInUser(username)) {
    return Promise.reject(new Error('auth.already_logged'));
  }
  // Public keys of user
  const publicKeys = {
    activeKey: account.active.key_auths.map(x => x[0])[0],
    memoKey: account.memo_key,
    ownerKey: account.owner.key_auths.map(x => x[0])[0],
    postingKey: account.posting.key_auths.map(x => x[0])[0],
  };

  // // Set private keys of user
  const privateKeys = getPrivateKeys(username, password);

  // Check all keys
  Object.keys(publicKeys).map(pubKey => {
    if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
      loginFlag = true;
      if (privateKeys.isMasterKey) authType = AUTH_TYPE.MASTER_KEY;
      else authType = pubKey;
    }
  });

  let jsonMetadata;
  try {
    jsonMetadata = JSON.parse(account.json_metadata) || '';
  } catch (err) {
    jsonMetadata = '';
  }
  if (Object.keys(jsonMetadata).length !== 0) {
    avatar = jsonMetadata.profile.profile_image || '';
  }
  if (loginFlag) {
    const userData = {
      username,
      avatar,
      authType,
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };

    if (isPinCodeOpen) {
      account.local = userData;
    } else {
      const resData = {
        pinCode: Config.DEFAULT_PIN,
        password,
      };
      const updatedUserData = await getUpdatedUserData(userData, resData);

      account.local = updatedUserData;
      account.local.avatar = avatar;
    }

    const authData = {
      isLoggedIn: true,
      currentUsername: username,
    };
    await setAuthStatus(authData);

    // Save user data to Realm DB
    await setUserData(account.local);
    await updateCurrentUsername(account.name);
    return { ...account, password };
  }
  return Promise.reject(new Error('auth.invalid_credentials'));
};

export const loginWithSC2 = async (code, isPinCodeOpen) => {
  const scTokens = await getSCAccessToken(code);
  await steemConnect.setAccessToken(scTokens.access_token);
  const scAccount = await steemConnect.me();
  const account = await getUser(scAccount.account.name);
  let avatar = '';

  return new Promise(async (resolve, reject) => {
    let jsonMetadata;
    try {
      jsonMetadata = JSON.parse(account.json_metadata) || '';
      if (Object.keys(jsonMetadata).length !== 0) {
        avatar = jsonMetadata.profile.profile_image || '';
      }
    } catch (error) {
      jsonMetadata = '';
    }
    const userData = {
      username: account.name,
      avatar,
      authType: AUTH_TYPE.STEEM_CONNECT,
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };

    if (isPinCodeOpen) {
      account.local = userData;
    } else {
      const resData = {
        pinCode: Config.DEFAULT_PIN,
        accessToken: scTokens.access_token,
      };
      const updatedUserData = await getUpdatedUserData(userData, resData);

      account.local = updatedUserData;
      account.local.avatar = avatar;
    }

    if (await isLoggedInUser(account.name)) {
      reject(new Error('auth.already_logged'));
    }

    setUserData(account.local)
      .then(async () => {
        updateCurrentUsername(account.name);
        const authData = {
          isLoggedIn: true,
          currentUsername: account.name,
        };
        await setAuthStatus(authData);
        await setSCAccount(scTokens);
        resolve({ ...account, accessToken: scTokens.access_token });
      })
      .catch(() => {
        reject(new Error('auth.unknow_error'));
      });
  });
};

export const setUserDataWithPinCode = async data => {
  try {
    const result = await getUserDataWithUsername(data.username);
    const userData = result[0];

    if (!data.password) {
      const publicKey =
        get(userData, 'masterKey') ||
        get(userData, 'activeKey') ||
        get(userData, 'memoKey') ||
        get(userData, 'postingKey');

      if (publicKey) {
        data.password = decryptKey(publicKey, data.pinCode);
      }
    }

    const updatedUserData = getUpdatedUserData(userData, data);

    await setPinCode(data.pinCode);
    await updateUserData(updatedUserData);

    return updatedUserData;
  } catch (error) {
    return Promise.reject(new Error('auth.unknow_error'));
  }
};

export const updatePinCode = data =>
  new Promise((resolve, reject) => {
    let currentUser = null;
    try {
      setPinCode(data.pinCode);
      getUserData().then(async users => {
        if (users && users.length > 0) {
          await users.forEach(userData => {
            if (
              userData.authType === AUTH_TYPE.MASTER_KEY ||
              userData.authType === AUTH_TYPE.ACTIVE_KEY ||
              userData.authType === AUTH_TYPE.MEMO_KEY ||
              userData.authType === AUTH_TYPE.POSTING_KEY
            ) {
              const publicKey =
                get(userData, 'masterKey') ||
                get(userData, 'activeKey') ||
                get(userData, 'memoKey') ||
                get(userData, 'postingKey');

              data.password = decryptKey(publicKey, data.oldPinCode);
            } else if (userData.authType === AUTH_TYPE.STEEM_CONNECT) {
              data.accessToken = decryptKey(userData.accessToken, data.oldPinCode);
            }
            const updatedUserData = getUpdatedUserData(userData, data);
            updateUserData(updatedUserData);
            if (userData.username === data.username) {
              currentUser = updatedUserData;
            }
          });
          resolve(currentUser);
        }
      });
    } catch (error) {
      reject(error.message);
    }
  });

export const verifyPinCode = async data => {
  const pinHash = await getPinCode();

  const result = await getUserDataWithUsername(data.username);
  const userData = result[0];

  // This is migration for new pin structure, it will remove v2.2
  if (!pinHash) {
    try {
      if (userData.authType === AUTH_TYPE.STEEM_CONNECT) {
        decryptKey(userData.accessToken, data.pinCode);
      } else {
        decryptKey(userData.masterKey, data.pinCode);
      }
      await setPinCode(data.pinCode);
    } catch (error) {
      return Promise.reject(new Error('Invalid pin code, please check and try again'));
    }
  }

  if (sha256(data.pinCode).toString() !== pinHash) {
    return Promise.reject(new Error('auth.invalid_pin'));
  }

  if (result.length > 0) {
    if (userData.authType === AUTH_TYPE.STEEM_CONNECT) {
      await refreshSCToken(userData, data.pinCode);
    }
  }
  return true;
};

export const refreshSCToken = async (userData, pinCode) => {
  const scAccount = await getSCAccount(userData.username);
  const now = new Date();
  const expireDate = new Date(scAccount.expireDate);
  if (now >= expireDate) {
    const newSCAccountData = await getSCAccessToken(scAccount.refreshToken);
    await setSCAccount(newSCAccountData);
    const accessToken = newSCAccountData.access_token;
    await updateUserData({ ...userData, accessToken: encryptKey(accessToken, pinCode) });
  }
};

export const switchAccount = username =>
  new Promise((resolve, reject) => {
    getUser(username)
      .then(account => {
        updateCurrentUsername(username)
          .then(() => {
            resolve(account);
          })
          .catch(() => {
            reject(new Error('auth.unknow_error'));
          });
      })
      .catch(() => {
        reject(new Error('auth.unknow_error'));
      });
  });

const getPrivateKeys = (username, password) => {
  try {
    return {
      activeKey: dsteem.PrivateKey.from(password),
      memoKey: dsteem.PrivateKey.from(password),
      ownerKey: dsteem.PrivateKey.from(password),
      postingKey: dsteem.PrivateKey.from(password),
      isMasterKey: false,
    };
  } catch (e) {
    return {
      activeKey: dsteem.PrivateKey.fromLogin(username, password, 'active'),
      memoKey: dsteem.PrivateKey.fromLogin(username, password, 'memo'),
      ownerKey: dsteem.PrivateKey.fromLogin(username, password, 'owner'),
      postingKey: dsteem.PrivateKey.fromLogin(username, password, 'posting'),
      isMasterKey: true,
    };
  }
};

export const getUpdatedUserData = (userData, data) => {
  const privateKeys = getPrivateKeys(userData.username, data.password);
  return {
    username: userData.username,
    authType: userData.authType,
    accessToken:
      userData.authType === AUTH_TYPE.STEEM_CONNECT
        ? encryptKey(data.accessToken, data.pinCode)
        : '',
    masterKey:
      userData.authType === AUTH_TYPE.MASTER_KEY ? encryptKey(data.password, data.pinCode) : '',
    postingKey:
      userData.authType === AUTH_TYPE.MASTER_KEY || userData.authType === AUTH_TYPE.POSTING_KEY
        ? encryptKey(privateKeys.postingKey.toString(), data.pinCode)
        : '',
    activeKey:
      userData.authType === AUTH_TYPE.MASTER_KEY || userData.authType === AUTH_TYPE.ACTIVE_KEY
        ? encryptKey(privateKeys.activeKey.toString(), data.pinCode)
        : '',
    memoKey:
      userData.authType === AUTH_TYPE.MASTER_KEY || userData.authType === AUTH_TYPE.MEMO_KEY
        ? encryptKey(privateKeys.memoKey.toString(), data.pinCode)
        : '',
  };
};

const isLoggedInUser = async username => {
  const result = await getUserDataWithUsername(username);
  if (result.length > 0) {
    return true;
  }
  return false;
};
