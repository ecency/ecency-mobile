import * as dsteem from 'dsteem';
import { getUser } from './dsteem';
import {
  setUserData,
  setAuthStatus,
  getUserDataWithUsername,
  updateUserData,
  setPinCode,
  getPinCode,
  updateCurrentUsername,
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
  let avatar = '';

  return new Promise((resolve, reject) => {
    // Get user account data from STEEM Blockchain
    getUser(username)
      .then((account) => {
        if (isLoggedInUser(username)) {
          reject(new Error('You are already logged in, please try to add another account'));
        }

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

        const jsonMetadata = JSON.parse(account.json_metadata);
        if (Object.keys(jsonMetadata).length !== 0) {
          avatar = jsonMetadata.profile.profile_image;
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
  let avatar = '';

  return new Promise((resolve, reject) => {

    try {
      const jsonMetadata = JSON.parse(account.account.json_metadata);
      if (Object.keys(jsonMetadata).length !== 0) {
        avatar = jsonMetadata.profile.profile_image;
      }
    } catch (error) {
      reject(new Error('Invalid credentails, please check and try again'));
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

    const authData = {
      isLoggedIn: true,
      currentUsername: account.account.name,
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
      username: userData.username,
      authType: 'steemConnect',
      accessToken: encryptKey(data.accessToken, data.pinCode),
      masterKey: '',
      postingKey: encryptKey(privateKeys.posting.toString(), data.pinCode),
      activeKey: encryptKey(privateKeys.active.toString(), data.pinCode),
      memoKey: encryptKey(privateKeys.memo.toString(), data.pinCode),
    };
  }

  updateUserData(updatedUserData)
    .then((response) => {
      const authData = {
        isLoggedIn: true,
        currentUsername: userData.username,
      };

      setAuthStatus(authData)
        .then(() => {
          const encriptedPinCode = encryptKey(data.pinCode, 'pin-code');
          setPinCode(encriptedPinCode)
            .then(() => {
              resolve(response);
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
});

export const getDigitPinCode = async () => decryptKey(await getPinCode(), 'pin-code');

export const verifyPinCode = async (data) => {
  const result = getUserDataWithUsername(data.username);
  const userData = result[0];
  let account = null;
  let loginFlag = false;
  if (result.length > 0) {
    if (userData.masterKey || userData.accessToken) {
      if (userData.authType === 'steemConnect') {
        const accessToken = decryptKey(userData.accessToken, data.pinCode);
        await steemConnect.setAccessToken(accessToken);
        account = await steemConnect.me();
        if (account) {
          loginFlag = true;
        }
      } else if (userData.authType === 'masterKey') {
        const password = decryptKey(userData.masterKey, data.pinCode);
        account = await getUser(data.username);

        // Public keys of user
        const publicKeys = {
          active: account.active.key_auths.map(x => x[0]),
          memo: account.memo_key,
          owner: account.owner.key_auths.map(x => x[0]),
          posting: account.posting.key_auths.map(x => x[0]),
        };
        // Set private keys of user
        const privateKeys = getPrivateKeys(data.username, password);

        // Check all keys
        Object.keys(publicKeys).map((pubKey) => {
          if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
            loginFlag = true;
          }
        });
      }
    } else {
      const encriptedPinCode = await getPinCode();
      const pinCode = decryptKey(encriptedPinCode, 'pin-code');
      if (pinCode === data.pinCode) {
        const res = await setUserDataWithPinCode(data);
        if (res) {
          loginFlag = true;
        }
      }
    }
  }

  return new Promise((resolve, reject) => {
    if (loginFlag) {
      const authData = {
        isLoggedIn: true,
        currentUsername: data.username,
      };
      const response = {
        accessToken: decryptKey(userData.accessToken, data.pinCode),
        postingKey: decryptKey(userData.postingKey, data.pinCode),
        masterKey: decryptKey(userData.masterKey, data.pinCode),
        activeKey: decryptKey(userData.activeKey, data.pinCode),
        memoKey: decryptKey(userData.memoKey, data.pinCode),
      };
      setAuthStatus(authData)
        .then(() => {
          resolve(response);
        })
        .catch(() => {
          // TODO: create function for throw error
          reject(new Error('Unknown error, please contact to eSteem.'));
        });
    } else {
      reject(new Error('Invalid pin code, please check and try again'));
    }
  });
};

export const switchAccount = username => new Promise((resolve, reject) => {
  getUser(username)
    .then((account) => {
      updateCurrentUsername(username).then(() => {
        resolve(account);
      }).catch(() => {
        reject(new Error('Unknown error, please contact to eSteem.'));
      });
    }).catch(() => {
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
