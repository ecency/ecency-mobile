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
        if (result.length < 1) {
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
              console.log('======1',error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log('======2',error);
          reject(error);
        });
    })
    .catch((err) => {
      console.log('======3',err);
      reject(err);
    });
  resolve();
});

export const verifyPinCode = data => new Promise((resolve, reject) => {
  const result = getUserDataWithUsername(data.username);
  const userData = result[0];
  let loginFlag = false;
  console.log('userData',userData);
  console.log('data',data);
  if (userData.masterKey || userData.accessToken) {
    const masterKey = decryptKey(userData.masterKey, data.pinCode);
    const accessToken = decryptKey(userData.accessToken, data.pinCode);
    console.log('masterKey',masterKey);
    console.log('accessToken',accessToken);
    if (masterKey === data.password || accessToken === data.accessToken) {
      loginFlag = true;
    }
  } else if (data.accessToken) {
    console.log('data.accessToken',data.accessToken);
    getPinCode()
      .then((encriptedPinCode) => {
        console.log('encriptedPinCode',encriptedPinCode);
        const pinCode = decryptKey(encriptedPinCode, 'pin-code');
        console.log('pinCode',pinCode);
        if (pinCode === data.pinCode) {
          loginFlag = true;
        }
      })
      .catch(() => {
        reject(new Error('Unknown error, please contact to eSteem.'));
      });
  }

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

const getPrivateKeys = (username, password) => ({
  active: dsteem.PrivateKey.fromLogin(username, password, 'active'),
  memo: dsteem.PrivateKey.fromLogin(username, password, 'memo'),
  owner: dsteem.PrivateKey.fromLogin(username, password, 'owner'),
  posting: dsteem.PrivateKey.fromLogin(username, password, 'posting'),
});

export const loginWithSC2 = async (accessToken) => {
  await steemConnect.setAccessToken(accessToken);
  const account = await steemConnect.me();

  return new Promise((resolve, reject) => {
    const userData = {
      username: account.name,
      authType: 'steemConnect',
      postingKey: '',
      masterKey: '',
      activeKey: '',
      memoKey: '',
    };

    const authData = {
      isLoggedIn: true,
    };

    setAuthStatus(authData)
      .then(() => {
        setUserData(userData)
          .then(() => {
            resolve({ ...account, accessToken });
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
