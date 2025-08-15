import { useEffect, useState } from 'react';
import { Linking, Keyboard } from 'react-native';

import HAS from 'hive-auth-wrapper';
import { v4 as uuidv4 } from 'uuid';
import { HiveSignerMessage } from 'utils/hive-signer-helper';
import { Operation } from '@hiveio/dhive';
import assert from 'assert';
import { useIntl } from 'react-intl';
import * as Sentry from '@sentry/react-native';
import { getDigitPinCode } from '../../../providers/hive/dhive';
import { loginWithHiveAuth } from '../../../providers/hive/auth';
import { useAppSelector, usePostLoginActions } from '../../../hooks';
import AUTH_TYPE from '../../../constants/authType';
import { decryptKey } from '../../../utils/crypto';
import { delay } from '../../../utils/editor';

const APP_META = {
  name: 'Ecency',
  description: 'Decentralised Social Blogging',
  icon: undefined,
};

const HAS_AUTH_URI = 'has://auth_req';
const HAS_SIGN_URI = 'has://sign_req';

export enum HiveAuthStatus {
  INPUT = 0,
  PROCESSING = 1,
  SUCCESS = 2,
  ERROR = 3,
}

export const useHiveAuth = () => {
  const intl = useIntl();
  const postLoginActions = usePostLoginActions();

  const pinHash = useAppSelector((state) => state.application.pin);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [statusText, setStatusText] = useState('');
  const [status, setStatus] = useState(HiveAuthStatus.INPUT);

  // initiate has web hook connection
  useEffect(() => {
    // Retrieving connection status
    HAS.connect().then(() => {
      const _status = HAS.status();
      console.log('has status', _status);
    });
  }, []);

  /**
   * authenticates user via installed hive auth or keychain app
   * compiles and set account data in redux store
   * @param username user to log in
   * @returns Promise<boolean> success status
   */
  const authenticate = async (username: string) => {
    setStatusText(intl.formatMessage({ id: 'hiveauth.initiating' }));
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

        const uri = `${HAS_AUTH_URI}/${encodedData}`;

        const _canOpenUri = await Linking.canOpenURL(uri);
        if (_canOpenUri) {
          setStatusText(intl.formatMessage({ id: 'hiveauth.authenticating' }));
          Linking.openURL(uri);
        } else {
          // TOOD: prompt to install valid keychain app
          setStatusText(intl.formatMessage({ id: 'hiveauth.not_installed' }));
          setStatus(HiveAuthStatus.ERROR);
        }
      };

      const authRes = await HAS.authenticate(auth, APP_META, challenge_data, _cbWait);

      setStatusText(intl.formatMessage({ id: 'hiveauth.logging_in' }));
      // update message with sign and encode to created hsCode
      messageObj.signatures = [authRes.data.challenge.challenge];
      const hsCode = btoa(JSON.stringify(messageObj));

      const accountData = await loginWithHiveAuth(hsCode, auth.key, auth.expire);

      postLoginActions.updateAccountsData(accountData);

      setStatusText(intl.formatMessage({ id: 'hiveauth.auth_success' }));
      setStatus(HiveAuthStatus.SUCCESS);

      await delay(2000);

      return true;
    } catch (error) {
      setStatusText(intl.formatMessage({ id: error.message || 'hiveauth.auth_fail' }));
      setStatus(HiveAuthStatus.ERROR);

      console.warn('Login failed', error);
      Sentry.captureException(error);
      return false;
    }
  };

  /**
   * Broadcasts ops array using hive auth app,
   * uses hive auth key from current account data
   * @param opsArray Operation array to broadcast
   * @returns Promise<boolean> success status
   */
  const broadcast = async (opsArray: Operation[]) => {
    try {
      assert(opsArray, intl.formatMessage({ id: 'hiveauth.missing_op_arr' }));
      assert(
        currentAccount.local.authType === AUTH_TYPE.HIVE_AUTH,
        intl.formatMessage({ id: 'hiveauth.invalid_auth_type' }),
      );

      setStatus(HiveAuthStatus.PROCESSING);
      setStatusText(intl.formatMessage({ id: 'hiveauth.initiating' }));
      await delay(1000);

      const _hiveAuthObj = {
        username: currentAccount.username,
        expiry: currentAccount.local.hiveAuthExpiry,
        key: decryptKey(currentAccount.local.hiveAuthKey, getDigitPinCode(pinHash)),
      };

      assert(_hiveAuthObj.key, intl.formatMessage({ id: 'hiveauth.decrypt_fail' }));
      assert(
        _hiveAuthObj.expiry > new Date().getTime(),
        intl.formatMessage({ id: 'hiveauth.expired' }),
      );

      const _cdWait = async (evt: any) => {
        console.log('sign wait', evt);

        const _canOpenUri = await Linking.canOpenURL(HAS_SIGN_URI);
        if (_canOpenUri) {
          setStatusText(intl.formatMessage({ id: 'hiveauth.requesting' }));
          Linking.openURL(HAS_SIGN_URI);
        } else {
          throw new Error(intl.formatMessage({ id: 'hiveauth.not_installed' }));
        }
      };

      const res = await HAS.broadcast(_hiveAuthObj, 'active', opsArray, _cdWait);

      if (res && res.broadcast) {
        console.log('broadcast response', res);
        // TODO: hive modal
        // respond back to transfer screen
      }

      setStatus(HiveAuthStatus.SUCCESS);
      setStatusText(intl.formatMessage({ id: 'hiveauth.transaction_success' }));
      await delay(2000);

      return true;
    } catch (error) {
      setStatus(HiveAuthStatus.ERROR);
      setStatusText(intl.formatMessage({ id: error.message || 'hiveauth.transaction_fail' }));

      console.warn('Transaction failed', error);
      Sentry.captureException(error);
      return false;
    }
  };

  const reset = () => {
    setStatus(HiveAuthStatus.INPUT);
    setStatusText('');
  };

  return {
    authenticate,
    broadcast,
    reset,
    status,
    statusText,
  };
};
