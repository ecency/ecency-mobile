import * as dsteem from '@esteemapp/dhive';
import Config from 'react-native-config';
import get from 'lodash/get';

import { getDigitPinCode, getMutes, getUser } from './dhive';
import { getPointsSummary } from '../ecency/ePoint';
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
} from '../../realm/realm';
import { encryptKey, decryptKey } from '../../utils/crypto';
import hsApi from './hivesignerAPI';
import { getSCAccessToken, getUnreadNotificationCount } from '../ecency/ecency';

// Constants
import AUTH_TYPE from '../../constants/authType';
import { makeHsCode } from '../../utils/hive-signer-helper';
import bugsnapInstance from '../../config/bugsnag';

export const login = async (username, password) => {
  let loginFlag = false;
  let avatar = '';
  let authType = '';
  // Get user account data from HIVE Blockchain
  const account = await getUser(username);

  if (!account) {
    return Promise.reject(new Error('auth.invalid_username'));
  }

  // if (isUserLoggedIn) {
  //   //TODO: write routine to overwrite account data if already logged in
  //   return Promise.reject(new Error('auth.already_logged'));
  // }

  // Public keys of user
  const publicKeys = {
    activeKey: get(account, 'active.key_auths', []).map((x) => x[0])[0],
    memoKey: get(account, 'memo_key', ''),
    ownerKey: get(account, 'owner.key_auths', []).map((x) => x[0])[0],
    postingKey: get(account, 'posting.key_auths', []).map((x) => x[0])[0],
  };

  // // Set private keys of user
  const privateKeys = getPrivateKeys(username, password);

  // Check all keys
  Object.keys(publicKeys).forEach((pubKey) => {
    if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
      loginFlag = true;
      if (privateKeys.isMasterKey) {
        authType = AUTH_TYPE.MASTER_KEY;
      } else {
        authType = pubKey;
      }
    }
  });

  const signerPrivateKey = privateKeys.ownerKey || privateKeys.activeKey || privateKeys.postingKey;
  const code = await makeHsCode(account.name, signerPrivateKey);
  const scTokens = await getSCAccessToken(code);

  try {
    const accessToken = scTokens?.access_token;
    account.unread_activity_count = await getUnreadNotificationCount(accessToken);
    account.pointsSummary = await getPointsSummary(account.username);
    account.mutes = await getMutes(account.username);
  } catch (err) {
    console.warn('Optional user data fetch failed, account can still function without them', err);
  }

  let jsonMetadata;
  try {
    jsonMetadata = JSON.parse(account.posting_json_metadata) || '';
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

    const resData = {
      pinCode: Config.DEFAULT_PIN,
      password,
      accessToken: get(scTokens, 'access_token', ''),
    };
    const updatedUserData = getUpdatedUserData(userData, resData);

    account.local = updatedUserData;
    account.local.avatar = avatar;

    const authData = {
      isLoggedIn: true,
      currentUsername: username,
    };
    await setAuthStatus(authData);
    await setSCAccount(scTokens);

    // Save user data to Realm DB
    await setUserData(account.local);
    await updateCurrentUsername(account.name);
    return {
      ...account,
      password,
    };
  }
  return Promise.reject(new Error('auth.invalid_credentials'));
};

export const loginWithSC2 = async (code) => {
  try {
    const scTokens = await getSCAccessToken(code);
    hsApi.setAccessToken(get(scTokens, 'access_token', ''));
    const scAccount = await hsApi.me();

    // NOTE: even though sAccount.account has account data but there are certain properties missing from hsApi variant, for instance account.username
    // that is why we still have to fetch account data using dhive, thought post processing done in dhive variant can be done in utils in future
    const account = await getUser(scAccount.account.name);
    let avatar = '';

    try {
      const accessToken = scTokens ? scTokens.access_token : '';
      account.unread_activity_count = await getUnreadNotificationCount(accessToken);
      account.pointsSummary = await getPointsSummary(account.username);
      account.mutes = await getMutes(account.username);
    } catch (err) {
      console.warn('Optional user data fetch failed, account can still function without them', err);
    }

    let jsonMetadata;
    try {
      jsonMetadata = JSON.parse(account.posting_json_metadata) || '';
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

    const resData = {
      pinCode: Config.DEFAULT_PIN,
      accessToken: get(scTokens, 'access_token', ''),
    };
    const updatedUserData = getUpdatedUserData(userData, resData);

    account.local = updatedUserData;
    account.local.avatar = avatar;

    await setUserData(account.local);

    await updateCurrentUsername(account.name);
    const authData = {
      isLoggedIn: true,
      currentUsername: account.name,
    };
    await setAuthStatus(authData);
    await setSCAccount(scTokens);

    return {
      ...account,
      accessToken: get(scTokens, 'access_token', ''),
    };
  } catch (err) {
    bugsnapInstance.notify(err);
    throw err;
  }
};

export const updatePinCode = (data) =>
  new Promise((resolve, reject) => {
    let currentUser = null;
    try {
      setPinCode(get(data, 'pinCode'));
      getUserData()
        .then(async (users) => {
          const _onDecryptError = () => {
            throw new Error('Decryption failed');
          };
          if (users && users.length > 0) {
            users.forEach((userData) => {
              if (
                get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
                get(userData, 'authType', '') === AUTH_TYPE.ACTIVE_KEY ||
                get(userData, 'authType', '') === AUTH_TYPE.MEMO_KEY ||
                get(userData, 'authType', '') === AUTH_TYPE.POSTING_KEY
              ) {
                const publicKey =
                  get(userData, 'masterKey') ||
                  get(userData, 'activeKey') ||
                  get(userData, 'memoKey') ||
                  get(userData, 'postingKey');

                const password = decryptKey(
                  publicKey,
                  get(data, 'oldPinCode', ''),
                  _onDecryptError,
                );
                if (password === undefined) {
                  return;
                }

                data.password = password;
              } else if (get(userData, 'authType', '') === AUTH_TYPE.STEEM_CONNECT) {
                const accessToken = decryptKey(
                  get(userData, 'accessToken'),
                  get(data, 'oldPinCode', ''),
                  _onDecryptError,
                );
                if (accessToken === undefined) {
                  return;
                }
                data.accessToken = accessToken;
              }
              const updatedUserData = getUpdatedUserData(userData, data);
              updateUserData(updatedUserData);
              if (userData.username === data.username) {
                currentUser = updatedUserData;
              }
            });
            resolve(currentUser);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error.message);
    }
  });

export const refreshSCToken = async (userData, pinCode) => {
  const scAccount = await getSCAccount(userData.username);
  const now = new Date().getTime();
  const expireDate = new Date(scAccount.expireDate).getTime();

  try {
    const newSCAccountData = await getSCAccessToken(scAccount.refreshToken);

    await setSCAccount(newSCAccountData);
    const accessToken = newSCAccountData.access_token;
    const encryptedAccessToken = encryptKey(accessToken, pinCode);
    await updateUserData({
      ...userData,
      accessToken: encryptedAccessToken,
    });
    return encryptedAccessToken;
  } catch (error) {
    if (now > expireDate) {
      throw error;
    } else {
      console.warn('token failed to refresh but current token is still valid');
    }
  }
};

export const switchAccount = (username) =>
  new Promise((resolve, reject) => {
    getUser(username)
      .then((account) => {
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

export const getPrivateKeys = (username, password) => {
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
  const privateKeys = getPrivateKeys(get(userData, 'username', ''), get(data, 'password'));

  return {
    username: get(userData, 'username', ''),
    authType: get(userData, 'authType', ''),
    accessToken: encryptKey(data.accessToken, get(data, 'pinCode')),

    masterKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY
        ? encryptKey(data.password, get(data, 'pinCode'))
        : get(userData, 'masterKey', ''),
    postingKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
        get(userData, 'authType', '') === AUTH_TYPE.POSTING_KEY
        ? encryptKey(get(privateKeys, 'postingKey', '').toString(), get(data, 'pinCode'))
        : get(userData, 'postingKey', ''),
    activeKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
        get(userData, 'authType', '') === AUTH_TYPE.ACTIVE_KEY
        ? encryptKey(get(privateKeys, 'activeKey', '').toString(), get(data, 'pinCode'))
        : get(userData, 'activeKey', ''),
    memoKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
        get(userData, 'authType', '') === AUTH_TYPE.MEMO_KEY
        ? encryptKey(get(privateKeys, 'memoKey', '').toString(), get(data, 'pinCode'))
        : get(userData, 'memoKey', ''),
    ownerKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
        get(userData, 'authType', '') === AUTH_TYPE.OWNER_KEY
        ? encryptKey(get(privateKeys, 'ownerKey', '').toString(), get(data, 'pinCode'))
        : get(userData, 'ownerKey', ''),
  };
};

export const getUpdatedUserKeys = async (currentAccountData, data) => {
  let loginFlag = false;
  // Get user account data from HIVE Blockchain
  // const account = await getUser(username);
  // Public keys of user
  const publicKeys = {
    activeKey: get(currentAccountData, 'active.key_auths', []).map((x) => x[0])[0],
    memoKey: get(currentAccountData, 'memo_key', ''),
    ownerKey: get(currentAccountData, 'owner.key_auths', []).map((x) => x[0])[0],
    postingKey: get(currentAccountData, 'posting.key_auths', []).map((x) => x[0])[0],
  };

  // // Set private keys of user
  const privateKeys = getPrivateKeys(data.username, data.password);

  // Check all keys
  Object.keys(publicKeys).forEach((pubKey) => {
    if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
      loginFlag = true;
    }
  });

  if (loginFlag) {
    currentAccountData.local = {
      ...currentAccountData.local,
      masterKey: encryptKey(data.password, get(data, 'pinCode')),
      postingKey: encryptKey(get(privateKeys, 'postingKey', '').toString(), get(data, 'pinCode')),
      activeKey: encryptKey(get(privateKeys, 'activeKey', '').toString(), get(data, 'pinCode')),
      memoKey: encryptKey(get(privateKeys, 'memoKey', '').toString(), get(data, 'pinCode')),
      ownerKey: encryptKey(get(privateKeys, 'ownerKey', '').toString(), get(data, 'pinCode')),
    };
    return currentAccountData;
  }
  return Promise.reject(new Error('auth.invalid_credentials'));
};

/**
 * This migration snippet is used to update access token for users logged in using masterKey
 * accessToken is required for all ecency api calls even for non hivesigner users.
 */
export const migrateToMasterKeyWithAccessToken = async (account, userData, pinHash) => {
  // get username, user local data from account;
  const username = account.name;

  // decrypt password from local data
  const pinCode = getDigitPinCode(pinHash);
  const password = decryptKey(
    userData.masterKey || userData.activeKey || userData.postingKey || userData.memoKey,
    pinCode,
  );

  // Set private keys of user
  const privateKeys = getPrivateKeys(username, password);

  const signerPrivateKey =
    privateKeys.ownerKey || privateKeys.activeKey || privateKeys.postingKey || privateKeys.memoKey;
  const code = await makeHsCode(account.name, signerPrivateKey);
  const scTokens = await getSCAccessToken(code);

  await setSCAccount(scTokens);
  const accessToken = scTokens.access_token;

  // update data
  const localData = {
    ...userData,
    accessToken: encryptKey(accessToken, pinCode),
  };
  // update realm
  await updateUserData(localData);

  // return account with update local data
  account.local = localData;
  return account;
};
