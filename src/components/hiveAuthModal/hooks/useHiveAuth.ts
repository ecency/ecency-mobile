
import { useEffect, useState } from 'react';
import { Linking, Keyboard } from 'react-native';

import HAS from 'hive-auth-wrapper';
import { v4 as uuidv4 } from 'uuid';
import { HiveSignerMessage } from 'utils/hive-signer-helper';
import { getDigitPinCode } from '../../../providers/hive/dhive';
import { loginWithHiveAuth } from '../../../providers/hive/auth';
import { useAppSelector, usePostLoginActions } from '../../../hooks';
import AUTH_TYPE from '../../../constants/authType';
import { decryptKey } from '../../../utils/crypto';
import { delay } from '../../../utils/editor';
import { Operation } from '@hiveio/dhive';
import assert from 'assert';


const APP_META = {
    name: 'Ecency',
    description: 'Decentralised Social Blogging',
    icon: undefined,
};


export enum HiveAuthStatus {
    INPUT = 0,
    PROCESSING = 1,
    SUCCESS = 2,
    ERROR = 3,
}



export const useHiveAuth = () => {

    const postLoginActions = usePostLoginActions();

    const pinHash = useAppSelector((state) => state.application.pin);
    const currentAccount = useAppSelector((state) => state.account.currentAccount);

    const [statusText, setStatusText] = useState('');
    const [status, setStatus] = useState(HiveAuthStatus.INPUT);

    useEffect(() => {
        // Retrieving connection status
        HAS.connect().then(() => {
            const _status = HAS.status();
            console.log('has status', _status);
        });
    }, []);


    const authenticate = async (username: string) => {
        setStatusText('Initiating...');
        setStatus(HiveAuthStatus.PROCESSING);

        Keyboard.dismiss();
        await delay(1000); // TODO: delay to assist modal settle height before show redirecting dialog

        try {
            // Create an authentication object
            const auth = {
                username, // required - replace "username" with your Hive account name (without the @)
                expire: undefined,
                key: uuidv4(),
            };

            // create a challenge/message to sign with the posting key
            // this sign is required for enabled hive sigenr support
            const timestamp = new Date().getTime() / 1000;
            const messageObj: HiveSignerMessage = {
                signed_message: { type: 'refresh', app: 'ecency.app' },
                authors: [auth.username],
                timestamp,
            };

            const challenge_data = {
                key_type: 'posting',
                challenge: JSON.stringify(messageObj),
            };

            // callback to initiate keychain authenticated request
            const _cbWait = async (evt: any) => {
                console.log(evt); // process auth_wait message

                const { username, key } = auth;
                const { host } = HAS.status();
                const { uuid } = evt;

                const payload = {
                    account: username,
                    uuid,
                    key,
                    host,
                };

                const encodedData = btoa(JSON.stringify(payload));

                console.log(encodedData);

                const uri = `has://auth_req/${encodedData}`;

                const _canOpenUri = await Linking.canOpenURL(uri);
                if (_canOpenUri) {
                    setStatusText('Authenticating...');
                    Linking.openURL(uri);
                } else {
                    // TOOD: prompt to install valid keychain app
                    setStatusText('Hive Authentication App Not Installed');
                    setStatus(HiveAuthStatus.ERROR);
                }
            };

            const authRes = await HAS.authenticate(auth, APP_META, challenge_data, _cbWait);

            setStatusText('Logging In...');
            // update message with sign and encode to created hsCode
            messageObj.signatures = [authRes.data.challenge.challenge];
            const hsCode = btoa(JSON.stringify(messageObj));

            // handleOnModalClose();
            const accountData = await loginWithHiveAuth(hsCode, auth.key, auth.expire);

            postLoginActions.updateAccountsData(accountData);

            setStatusText('Authentication Success!');
            setStatus(HiveAuthStatus.SUCCESS);

            await delay(2000);

            return true;


        } catch (error) {
            console.warn('Login failed');
            setStatusText(error.message || 'Authentication Failed');
            setStatus(HiveAuthStatus.ERROR);
            return false;
        }
    };



    const broadcast = async (opsArray: Operation[]) => {
        try {

            assert(opsArray, 'Missing operations array to broadcast');
            assert(currentAccount.local.authType === AUTH_TYPE.HIVE_AUTH, "Invalid auth type")

            setStatus(HiveAuthStatus.PROCESSING);
            setStatusText('Initializing...');
            await delay(1000);


            const _hiveAuthObj = {
                username: currentAccount.username,
                expiry: currentAccount.local.hiveAuthExpiry,
                key: decryptKey(currentAccount.local.hiveAuthKey, getDigitPinCode(pinHash)),
            };

            assert(_hiveAuthObj.key, 'Failed to decrypt hive auth key')
            assert(_hiveAuthObj.expiry > new Date().getTime(), 'Hive Auth Key is expired, reauthenticate and try again')


            const _cdWait = async (evt: any) => {
                console.log('sign wait', evt);

                const _canOpenUri = await Linking.canOpenURL('has://sign_req');
                if (_canOpenUri) {
                    setStatusText('Requesting...');
                    Linking.openURL('has://sign_req');
                } else {
                    throw new Error('Hive Authentication App Not Installed');
                }
            };

            const res = await HAS.broadcast(_hiveAuthObj, 'active', opsArray, _cdWait);

            if (res && res.broadcast) {
                console.log('broadcast response', res);
                // TODO: hive modal
                // respond back to transfer screen
            }

            setStatus(HiveAuthStatus.SUCCESS);
            setStatusText('Transaction Successful!');
            await delay(2000);

            return true;

        } catch (error) {
            setStatus(HiveAuthStatus.ERROR);
            setStatusText(error.message || 'Transaction Rejected!');
            return false;
        }
    }


    const reset = () => {
        setStatus(HiveAuthStatus.INPUT);
        setStatusText('')

    }

    return {
        authenticate,
        broadcast,
        reset,
        status,
        statusText
    }
}