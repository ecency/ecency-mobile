/*eslint-disable no-unused-vars*/
/*eslint-disable no-console*/
import * as dsteem from "dsteem";
import { getAccount } from "./dsteem";
import {
    setUserData,
    setAuthStatus,
    getUserData,
    updateUserData,
    removeUserData,
} from "../../realm/realm";
/*eslint-disable-next-line no-unused-vars*/
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
                    reject(new Error("Wrong @username"));
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

                Object.keys(publicKeys).map(pubKey => {
                    if (
                        publicKeys[pubKey] ===
                        privateKeys[pubKey].createPublic().toString()
                    ) {
                        loginFlag = true;
                        resultKeys[pubKey] = publicKeys[pubKey];
                    }
                });

                if (loginFlag) {
                    let userData = {
                        id: account.id,
                        username: username,
                        authType: "masterKey",
                        masterKey: "",
                        postingKey: "",
                        activeKey: "",
                        memoKey: "",
                        accessToken: "",
                    };
                    let authData = {
                        isLoggedIn: true,
                    };

                    // Set auth state to true
                    setAuthStatus(authData)
                        .then(() => {
                            // Save user data to Realm DB
                            setUserData(userData)
                                .then(() => {
                                    resolve({ ...account, password });
                                })
                                .catch(err => {
                                    reject(err);
                                });
                        })
                        .catch(err => {
                            reject(err);
                        });
                } else {
                    reject();
                }
            })
            .catch(err => {
                // eslint-disable-next-line
                console.log(err);
                reject(new Error("Check your username"));
            });
    });
};

export const setUserDataWithPinCode = (pinCode, password) =>
    new Promise((resolve, reject) => {
        getUserData().then(result => {
            const userData = Array.from(result)[0];

            const privateKeys = getPrivateKeys(userData.username, password);

            const updatedUserData = {
                username: userData.username,
                authType: "masterKey",
                masterKey: encryptKey(password, pinCode),
                postingKey: encryptKey(privateKeys.posting.toString(), pinCode),
                activeKey: encryptKey(privateKeys.active.toString(), pinCode),
                memoKey: encryptKey(privateKeys.memo.toString(), pinCode),
            };

            updateUserData(updatedUserData)
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
        resolve();
    });

export const verifyPinCode = (pinCode, password) =>
    new Promise((resolve, reject) => {
        getUserData().then(result => {
            const userData = Array.from(result)[0];
            const masterKey = decryptKey(userData.masterKey, pinCode);
            if (masterKey === password) {
                resolve();
            } else {
                reject();
            }
        });
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

    //console.log(account.name);

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
