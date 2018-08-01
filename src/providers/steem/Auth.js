import * as dsteem from 'dsteem';
import { getAccount } from './Dsteem';
import { AsyncStorage } from 'react-native';

export const Login = (username, password) => {
    let account;
    let publicKeys;
    let privateKeys;
    let isPassword;
    let isPostingKey;

    return new Promise((resolve, reject) => {
        getAccount(username)
            .then(result => {
                if (result.length < 1) {
                    reject(new Error('Wrong @username'));
                }

                account = result[0];

                // Public keys of user
                publicKeys = {
                    active: account['active'].key_auths.map(x => x[0]),
                    memo: account['memo_key'],
                    owner: account['owner'].key_auths.map(x => x[0]),
                    posting: account['posting'].key_auths.map(x => x[0]),
                };
            })
            .then(() => {
                try {
                    // Set private keys of user
                    privateKeys = {
                        active: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            'active'
                        ).toString(),
                        memo: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            'memo'
                        ).toString(),
                        owner: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            'owner'
                        ).toString(),
                        posting: dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            'posting'
                        ).toString(),
                    };
                } catch (error) {
                    reject(new Error('Wrong Key/Password'));
                }
            })
            .then(() => {
                try {
                    isPassword =
                        dsteem.PrivateKey.fromLogin(
                            username,
                            password,
                            'posting'
                        )
                            .createPublic()
                            .toString() === publicKeys.posting.toString();

                    if (isPassword) {
                        let authType = {
                            username: username,
                            auth_type: 'master_key',
                            posting_key: privateKeys.posting,
                            active_key: privateKeys.active,
                            memo_key: privateKeys.memo,
                            owner_key: privateKeys.owner,
                        };

                        AsyncStorage.setItem('isLoggedIn', 'true', () => {
                            AsyncStorage.setItem(
                                'user',
                                JSON.stringify(authType),
                                () => {
                                    resolve(isPassword);
                                }
                            );
                        });
                    } else {
                        isPostingKey =
                            publicKeys.posting.toString() ===
                            dsteem.PrivateKey.fromString(password)
                                .createPublic()
                                .toString();

                        let authType = {
                            username: username,
                            auth_type: 'posting_key',
                            posting_key: password,
                        };

                        try {
                            if (isPostingKey) {
                                AsyncStorage.setItem(
                                    'isLoggedIn',
                                    'true',
                                    () => {
                                        AsyncStorage.setItem(
                                            'user',
                                            JSON.stringify(authType),
                                            () => {
                                                resolve(isPostingKey);
                                            }
                                        );
                                    }
                                );
                            } else {
                                reject(new Error('Wrong Key/Password'));
                            }
                        } catch (error) {
                            reject(new Error('Wrong Key/Password'));
                        }
                    }
                } catch (error) {
                    reject(new Error('Wrong Key/Password'));
                }
            })
            .catch(err => {
                reject(new Error('Check your username'));
            });
    });
};
