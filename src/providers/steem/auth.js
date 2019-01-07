import * as dsteem from 'dsteem';
import sha256 from 'crypto-js/sha256';

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

export const login = async (username, password) => {
  const resultKeys = {
    active: null,
    memo: null,
    owner: null,
    posting: null,
  };
  let loginFlag = false;
  let avatar = '';
  // Get user account data from STEEM Blockchain
  const account = await getUser(username);
  if (!account) {
    return Promise.reject(new Error('Invalid pin code, please check and try again'));
  }
  if (isLoggedInUser(username)) {
    return Promise.reject(
      new Error('You are already logged in, please try to add another account'),
    );
  }

  // Public keys of user
  const publicKeys = {
    active: account.active.key_auths.map(x => x[0]),
    memo: account.memo_key,
    owner: account.owner.key_auths.map(x => x[0]),
    posting: account.posting.key_auths.map(x => x[0]),
  };

  // Set private keys of user
  const privateKeys = getPrivateKeys(username, password);

  // Check all keys
  Object.keys(publicKeys).map((pubKey) => {
    if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
      loginFlag = true;
      resultKeys[pubKey] = publicKeys[pubKey];
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
      authType: 'masterKey',
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };

    account.local = userData;

    const authData = {
      isLoggedIn: true,
      currentUsername: username,
    };
    await setAuthStatus(authData);

    // Save user data to Realm DB
    await setUserData(userData);
    await updateCurrentUsername(account.name);
    return { ...account, password };
  }
  return Promise.reject(new Error('Invalid pin code, please check and try again'));
};

export const loginWithSC2 = async (code) => {
  const scTokens = await getSCAccessToken(code);
  await steemConnect.setAccessToken(scTokens.access_token);
  const account = await steemConnect.me();
  let avatar = '';

  return new Promise((resolve, reject) => {
    try {
      const jsonMetadata = JSON.parse(account.account.json_metadata);
      if (Object.keys(jsonMetadata).length !== 0) {
        avatar = jsonMetadata.profile.profile_image || '';
      }
    } catch (error) {
      reject(new Error('Invalid credentials, please check and try again'));
    }
    const userData = {
      username: account.account.name,
      avatar,
      authType: 'steemConnect',
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };

    if (isLoggedInUser(account.account.name)) {
      reject(new Error('You are already logged in, please try to add another account'));
    }

    setUserData(userData)
      .then(async () => {
        account.account.username = account.account.name;
        updateCurrentUsername(account.account.name);
        const authData = {
          isLoggedIn: true,
          currentUsername: account.account.name,
        };
        await setAuthStatus(authData);
        await setSCAccount(scTokens);
        resolve({ ...account.account, accessToken: scTokens.access_token });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const setUserDataWithPinCode = async (data) => {
  try {
    const result = getUserDataWithUsername(data.username);
    const userData = result[0];

    const privateKeys = getPrivateKeys(userData.username, data.password);
    const updatedUserData = {
      username: userData.username,
      authType: userData.authType,
      accessToken:
        userData.authType === 'steemConnect' ? encryptKey(data.accessToken, data.pinCode) : '',
      masterKey: userData.authType === 'masterKey' ? encryptKey(data.password, data.pinCode) : '',
      postingKey: encryptKey(privateKeys.posting.toString(), data.pinCode),
      activeKey: encryptKey(privateKeys.active.toString(), data.pinCode),
      memoKey: encryptKey(privateKeys.memo.toString(), data.pinCode),
    };

    await setPinCode(data.pinCode);
    await updateUserData(updatedUserData);

    return updatedUserData;
  } catch (error) {
    return Promise.reject(new Error('Unknown error, please contact to eSteem.'));
  }
};

export const updatePinCode = async (data) => {
  let password = null;
  let accessToken = null;
  try {
    await setPinCode(data.pinCode);
    const users = await getUserData();
    if (users.length > 0) {
      users.forEach(async (userData) => {
        if (userData.authType === 'masterKey') {
          password = decryptKey(userData.masterKey, data.oldPinCode);
        } else if (userData.authType === 'steemConnect') {
          accessToken = decryptKey(userData.accessToken, data.oldPinCode);
        }
        const privateKeys = getPrivateKeys(userData.username, password);
        const updatedUserData = {
          username: userData.username,
          authType: userData.authType,
          accessToken:
            userData.authType === 'steemConnect' ? encryptKey(accessToken, data.pinCode) : '',
          masterKey: userData.authType === 'masterKey' ? encryptKey(password, data.pinCode) : '',
          postingKey: encryptKey(privateKeys.posting.toString(), data.pinCode),
          activeKey: encryptKey(privateKeys.active.toString(), data.pinCode),
          memoKey: encryptKey(privateKeys.memo.toString(), data.pinCode),
        };
        await updateUserData(updatedUserData);
      });
      return true;
    }
    return false;
  } catch (error) {
    return Promise.reject(new Error('Unknown error, please contact to eSteem.'));
  }
};

export const verifyPinCode = async (data) => {
  const pinHash = await getPinCode();

  if (sha256(data.pinCode).toString() !== pinHash) {
    return Promise.reject(new Error('Invalid pin code, please check and try again'));
  }

  const result = getUserDataWithUsername(data.username);
  const userData = result[0];
  if (result.length > 0) {
    if (userData.authType === 'steemConnect') {
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

export const switchAccount = username => new Promise((resolve, reject) => {
  getUser(username)
    .then((account) => {
      updateCurrentUsername(username)
        .then(() => {
          resolve(account);
        })
        .catch(() => {
          reject(new Error('Unknown error, please contact to eSteem.'));
        });
    })
    .catch(() => {
      reject(new Error('Unknown error, please contact to eSteem.'));
    });
});

const getPrivateKeys = (username, password) => ({
  active: dsteem.PrivateKey.fromLogin(username, password, 'active'),
  memo: dsteem.PrivateKey.fromLogin(username, password, 'memo'),
  owner: dsteem.PrivateKey.fromLogin(username, password, 'owner'),
  posting: dsteem.PrivateKey.fromLogin(username, password, 'posting'),
});

const isLoggedInUser = (username) => {
  const result = getUserDataWithUsername(username);
  if (result.length > 0) {
    return true;
  }
  return false;
};
