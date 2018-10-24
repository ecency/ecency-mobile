import * as dsteem from 'dsteem';
import { getAccount } from './dsteem';
import {
  setUserData,
  setAuthStatus,
  getUserDataWithUsername,
  updateUserData,
  setPinCode,
  getPinCode,
} from '../../realm/realm';
import { encryptKey, decryptKey } from '../../utils/crypto';
import steemConnect from './steemConnectAPI';

export const Login = (username, password) => {
  let publicKeys;
  let privateKeys;
  const resultKeys = {
    active: null,
    memo: null,
    owner: null,
    posting: null,
  };
  let loginFlag = false;

  return new Promise((resolve, reject) => {
    // Get user account data from STEEM Blockchain
    getAccount(username)
      .then((result) => {
        if (isLoggedInUser(username)) {
          reject(new Error('You are already logged in, please try to add another account'));
        } else if (result.length < 1) {
          reject(new Error('Invalid credentails, please check and try again'));
        }

        const account = result[0];

        // Public keys of user
        publicKeys = {
          active: account.active.key_auths.map(x => x[0]),
          memo: account.memo_key,
          owner: account.owner.key_auths.map(x => x[0]),
          posting: account.posting.key_auths.map(x => x[0]),
        };

        // Set private keys of user
        privateKeys = getPrivateKeys(username, password);

        // Check all keys
        Object.keys(publicKeys).map((pubKey) => {
          if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
            loginFlag = true;
            resultKeys[pubKey] = publicKeys[pubKey];
          }
        });

        if (loginFlag) {
          const userData = {
            username,
            authType: 'masterKey',
            masterKey: '',
            postingKey: '',
            activeKey: '',
            memoKey: '',
            accessToken: '',
          };

          // Save user data to Realm DB
          setUserData(userData)
            .then(() => {
              resolve({ ...account, password });
            })
            .catch(() => {
              reject(new Error('Invalid credentails, please check and try again'));
            });
        } else {
          reject(new Error('Invalid credentails, please check and try again'));
        }
      })
      .catch(() => {
        reject(new Error('Invalid credentails, please check and try again'));
      });
  });
};

export const loginWithSC2 = async (accessToken) => {
  await steemConnect.setAccessToken(accessToken);
  const account = await steemConnect.me();

  return new Promise((resolve, reject) => {
    const userData = {
      username: account.account.name,
      authType: 'steemConnect',
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };

    const authData = {
      isLoggedIn: true,
    };

    if (isLoggedInUser(account.account.name)) {
      reject(new Error('You are already logged in, please try to add another account'));
    }

    setAuthStatus(authData)
      .then(() => {
        setUserData(userData)
          .then(() => {
            resolve({ ...account.account, accessToken });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};


export const setUserDataWithPinCode = data => new Promise((resolve, reject) => {
  let updatedUserData;
  const result = getUserDataWithUsername(data.username);
  const userData = result[0];

  const privateKeys = getPrivateKeys(userData.username, data.password);

  if (userData.authType === 'masterKey') {
    updatedUserData = {
      username: userData.username,
      authType: 'masterKey',
      masterKey: encryptKey(data.password, data.pinCode),
      postingKey: encryptKey(privateKeys.posting.toString(), data.pinCode),
      activeKey: encryptKey(privateKeys.active.toString(), data.pinCode),
      memoKey: encryptKey(privateKeys.memo.toString(), data.pinCode),
    };
  } else if (userData.authType === 'steemConnect') {
    updatedUserData = {
      username: userData.name,
      authType: 'steemConnect',
      accessToken: encryptKey(data.accessToken, data.pinCode),
      postingKey: '',
      masterKey: '',
      activeKey: '',
      memoKey: '',
    };
  }

  updateUserData(updatedUserData)
    .then(() => {
      const authData = {
        isLoggedIn: true,
      };

      setAuthStatus(authData)
        .then(() => {
          const encriptedPinCode = encryptKey(data.pinCode, 'pin-code');
          setPinCode(encriptedPinCode)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    })
    .catch((err) => {
      reject(err);
    });
  resolve();
});

export const verifyPinCode = async (data) => {
  const result = getUserDataWithUsername(data.username);
  const userData = result[0];
  let loginFlag = false;
  if (userData.masterKey || userData.accessToken) {
    const masterKey = decryptKey(userData.masterKey, data.pinCode);
    const accessToken = decryptKey(userData.accessToken, data.pinCode);
    if (masterKey === data.password || (data.accessToken && accessToken === data.accessToken)) {
      loginFlag = true;
    }
  } else if (data.accessToken) {
    const encriptedPinCode = await getPinCode();
    const pinCode = decryptKey(encriptedPinCode, 'pin-code');
    if (pinCode == data.pinCode) {
      loginFlag = true;
    }
  }
  return new Promise((resolve, reject) => {
    if (loginFlag) {
      const authData = {
        isLoggedIn: true,
      };
      setAuthStatus(authData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          // TODO: create function for throw error
          reject(new Error('Unknown error, please contact to eSteem.'));
        });
    } else {
      reject(new Error('Invalid pin code, please check and try again'));
    }
  });
};

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
