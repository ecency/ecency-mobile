import * as dsteem from "dsteem";
import { getAccount } from "./dsteem";
import {
  setUserData,
  setAuthStatus,
  getUserDataWithUsername,
  updateUserData,
} from "../../realm/realm";
import { encryptKey, decryptKey } from "../../utils/crypto";
import steemConnect from "./steemConnectAPI";

export const Login = (username, password) => {
  let publicKeys;
  let privateKeys;
  let resultKeys = { active: null, memo: null, owner: null, posting: null };
  let loginFlag = false;

  return new Promise((resolve, reject) => {
    // Get user account data from STEEM Blockchain
    getAccount(username)
      .then(result => {
        if (result.length < 1) {
          reject(new Error("Invalid credentails, please check and try again"));
        }

        const account = result[0];

        // Public keys of user
        publicKeys = {
          active: account["active"].key_auths.map(x => x[0]),
          memo: account["memo_key"],
          owner: account["owner"].key_auths.map(x => x[0]),
          posting: account["posting"].key_auths.map(x => x[0]),
        };

        // Set private keys of user
        privateKeys = getPrivateKeys(username, password);

        // Check all keys
        Object.keys(publicKeys).map(pubKey => {
          if (
            publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()
          ) {
            loginFlag = true;
            resultKeys[pubKey] = publicKeys[pubKey];
          }
        });

        if (loginFlag) {
          let userData = {
            username: username,
            authType: "masterKey",
            masterKey: "",
            postingKey: "",
            activeKey: "",
            memoKey: "",
            accessToken: "",
          };

          // Save user data to Realm DB
          setUserData(userData)
            .then(() => {
              resolve({ ...account, password });
            })
            .catch(() => {
              reject(
                new Error("Invalid credentails, please check and try again")
              );
            });
        } else {
          reject(new Error("Invalid credentails, please check and try again"));
        }
      })
      .catch(() => {
        reject(new Error("Invalid credentails, please check and try again"));
      });
  });
};

export const setUserDataWithPinCode = data =>
  new Promise((resolve, reject) => {
    const result = getUserDataWithUsername(data.username);
    const userData = result[0];

    const privateKeys = getPrivateKeys(userData.username, data.password);

    const updatedUserData = {
      username: userData.username,
      authType: "masterKey",
      masterKey: encryptKey(data.password, data.pinCode),
      postingKey: encryptKey(privateKeys.posting.toString(), data.pinCode),
      activeKey: encryptKey(privateKeys.active.toString(), data.pinCode),
      memoKey: encryptKey(privateKeys.memo.toString(), data.pinCode),
    };

    updateUserData(updatedUserData)
      .then(() => {
        let authData = {
          isLoggedIn: true,
        };

        setAuthStatus(authData)
          .then(() => {
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
    resolve();
  });

export const verifyPinCode = data =>
  new Promise((resolve, reject) => {
    const result = getUserDataWithUsername(data.username);
    const userData = result[0];
    const masterKey = decryptKey(userData.masterKey, data.pinCode);
    if (masterKey === data.password) {
      let authData = {
        isLoggedIn: true,
      };

      setAuthStatus(authData)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(new Error("Invalid pin code, please check and try again"));
        });
    } else {
      reject(new Error("Invalid pin code, please check and try again"));
      reject();
    }
  });

const getPrivateKeys = (username, password) => {
  return {
    active: dsteem.PrivateKey.fromLogin(username, password, "active"),
    memo: dsteem.PrivateKey.fromLogin(username, password, "memo"),
    owner: dsteem.PrivateKey.fromLogin(username, password, "owner"),
    posting: dsteem.PrivateKey.fromLogin(username, password, "posting"),
  };
};
export const loginWithSC2 = async (access_token, pinCode) => {
  let account;

  await steemConnect.setAccessToken(access_token);
  account = await steemConnect.me();

  return new Promise((resolve, reject) => {
    let userData = {
      username: account.name,
      authType: "steemConnect",
      accessToken: encryptKey(access_token, pinCode),
      postingKey: "",
      masterKey: "",
      activeKey: "",
      memoKey: "",
    };

    let authData = {
      isLoggedIn: true,
    };

    setAuthStatus(authData)
      .then(() => {
        setUserData(userData)
          .then(() => {
            resolve(true);
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
};
