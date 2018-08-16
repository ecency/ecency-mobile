import * as dsteem from "dsteem";
import { getAccount } from "./Dsteem";
import { setUserData, setAuthStatus } from "../../realm/Realm";
/*eslint-disable-next-line no-unused-vars*/
import { encryptKey, decryptKey } from "../../utils/Crypto";

export const Login = (username, password) => {
    let account;
    let publicKeys;
    let privateKeys;
    let isPassword;
    let isPostingKey;
    let pinCode = "pinCode";

    return new Promise((resolve, reject) => {
        // Get user account data from STEEM Blockchain
        getAccount(username)
            .then(result => {
                if (result.length < 1) {
                    reject(new Error("Wrong @username"));
                }

                account = result[0];

                // Public keys of user
                publicKeys = {
                    active: account["active"].key_auths.map(x => x[0]),
                    memo: account["memo_key"],
                    owner: account["owner"].key_auths.map(x => x[0]),
                    posting: account["posting"].key_auths.map(x => x[0]),
                };
            })
            .then(() => {
                try {
                    // Set private keys of user
                    privateKeys = {
                        active: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            "active"
                        ).toString(),
                        memo: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            "memo"
                        ).toString(),
                        owner: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            "owner"
                        ).toString(),
                        posting: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            "posting"
                        ).toString(),
                    };
                } catch (error) {
                    reject(new Error("Wrong Key/Password"));
                }
            })
            .then(() => {
                // Validate Pasword/Key
                try {
                    // Validate Master Key
                    /*eslint-disable no-mixed-spaces-and-tabs*/
                    isPassword =
                        dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            "posting"
                        )
                            .createPublic()
                            .toString() === publicKeys.posting.toString();

                    if (isPassword) {
                        /**
                         * User data
                         * TODO: Encryption
                         */
                        let userData = {
                            username: username,
                            authType: "masterKey",
                            masterKey: encryptKey(password, pinCode),
                            postingKey: encryptKey(
                                privateKeys.posting,
                                pinCode
                            ),
                            activeKey: encryptKey(privateKeys.active, pinCode),
                            memoKey: encryptKey(privateKeys.memo, pinCode),
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
                                        resolve(isPassword);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            })
                            .catch(err => {
                                reject(err);
                            });
                    } else {
                        // Validate Posting Key
                        isPostingKey =
                            publicKeys.posting.toString() ===
                            dsteem.PrivateKey.fromString(password)
                                .createPublic()
                                .toString();

                        /**
                         * User data
                         * TODO: Encryption
                         */
                        let userData = {
                            username: username,
                            authType: "postingKey",
                            postingKey: privateKeys.posting,
                            masterKey: "",
                            activeKey: "",
                            memoKey: "",
                        };

                        let authData = {
                            isLoggedIn: true,
                        };

                        try {
                            if (isPostingKey) {
                                // Set auth state to true
                                setAuthStatus(authData)
                                    .then(() => {
                                        // Save user data to Realm DB
                                        setUserData(userData)
                                            .then(() => {
                                                resolve(isPostingKey);
                                            })
                                            .catch(err => {
                                                reject(err);
                                            });
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            } else {
                                reject(new Error("Wrong Key/Password"));
                            }
                        } catch (error) {
                            reject(new Error("Wrong Key/Password"));
                        }
                    }
                } catch (error) {
                    reject(new Error("Wrong Key/Password"));
                }
            })
            .catch(err => {
                // eslint-disable-next-line
                console.log(err);
                reject(new Error("Check your username"));
            });
    });
};
