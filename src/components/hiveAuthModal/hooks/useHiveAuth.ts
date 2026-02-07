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
import { selectPin, selectCurrentAccount } from '../../../redux/selectors';

const APP_META = {
  name: 'Ecency',
  description: 'Decentralised Social Blogging',
  icon: undefined,
};

const HIVE_AUTH_SCHEMES = ['has', 'waves'] as const;

type HiveAuthScheme = (typeof HIVE_AUTH_SCHEMES)[number];

const parseSchemeFromValue = (value: unknown): HiveAuthScheme | null => {
  if (!value) {
    return null;
  }

  const parseString = (raw: string) => {
    const candidate = raw.split('://')[0]?.toLowerCase();

    return HIVE_AUTH_SCHEMES.includes(candidate as HiveAuthScheme)
      ? (candidate as HiveAuthScheme)
      : null;
  };

  if (typeof value === 'string') {
    return parseString(value);
  }

  if (Array.isArray(value)) {
    let matched: HiveAuthScheme | null = null;

    value.some((entry) => {
      const scheme = parseSchemeFromValue(entry);
      if (scheme) {
        matched = scheme;
        return true;
      }

      return false;
    });

    return matched;
  }

  return null;
};

const extractPreferredScheme = (evt: any): HiveAuthScheme | null => {
  const candidates: unknown[] = [
    evt?.scheme,
    evt?.host,
    evt?.redirect,
    evt?.app?.scheme,
    evt?.app?.host,
    evt?.app?.redirect,
    evt?.hosts,
    evt?.app?.hosts,
  ];

  let resolvedScheme: HiveAuthScheme | null = null;

  candidates.some((candidate) => {
    const scheme = parseSchemeFromValue(candidate);
    if (scheme) {
      resolvedScheme = scheme;
      return true;
    }

    return false;
  });

  if (resolvedScheme) {
    return resolvedScheme;
  }

  const appName = evt?.app?.name ? String(evt.app.name).toLowerCase() : null;

  if (appName) {
    if (appName.includes('wave')) {
      return 'waves';
    }

    if (appName.includes('has') || appName.includes('hive')) {
      return 'has';
    }
  }

  return null;
};

const getHiveAuthUri = async (path: string, preferredScheme?: HiveAuthScheme | null) => {
  const schemesToTry: HiveAuthScheme[] = preferredScheme
    ? [preferredScheme]
    : [...HIVE_AUTH_SCHEMES];

  const results = await Promise.all(
    schemesToTry.map(async (scheme) => {
      const uri = `${scheme}://${path}`;

      try {
        const canOpen = await Linking.canOpenURL(uri);
        return canOpen ? uri : null;
      } catch (error) {
        console.warn(`Unable to query Hive Auth scheme ${scheme}`, error);
        return null;
      }
    }),
  );

  return results.find((uri): uri is string => Boolean(uri)) ?? null;
};

/**
 * Infers the required key type (posting or active) based on operation types
 * Matches the logic from vision-next website for consistency
 * @param opsArray Array of operations to analyze
 * @returns 'posting' or 'active' key type
 */
const inferOperationKeyType = (opsArray: Operation[]): 'posting' | 'active' => {
  const postingOnlyOps = new Set([
    'vote',
    'comment',
    'comment_options',
    'delete_comment',
    'claim_reward_balance',
    'account_update2', // Profile metadata updates (avatar, cover, bio, etc.)
  ]);

  const flags = opsArray.reduce(
    (acc, [opName, opPayload]) => {
      if (opName === 'custom_json') {
        const payload = opPayload as any;
        if (payload?.required_auths && payload.required_auths.length > 0) {
          acc.sawActive = true;
        } else if (payload?.required_posting_auths && payload.required_posting_auths.length > 0) {
          acc.sawPosting = true;
        }
        return acc;
      }

      if (postingOnlyOps.has(opName)) {
        acc.sawPosting = true;
      } else {
        acc.sawActive = true;
      }
      return acc;
    },
    { sawActive: false, sawPosting: false },
  );

  if (flags.sawActive) {
    return 'active';
  }
  if (flags.sawPosting) {
    return 'posting';
  }
  return 'posting';
};

/**
 * Checks if an error from HAS.broadcast() indicates the account session
 * is not registered on the HAS relay (e.g. after WebSocket reconnect or session expiry).
 */
const isHasNotConnectedError = (error: any): boolean => {
  const candidates = [
    error?.message,
    error?.error,
    typeof error === 'string' ? error : null,
  ].filter(Boolean);

  return candidates.some((s) => /not been connected through HAS/i.test(String(s)));
};

export enum HiveAuthStatus {
  INPUT = 0,
  PROCESSING = 1,
  SUCCESS = 2,
  ERROR = 3,
}

// Module-level singleton: connect to HAS relay once, shared across all useHiveAuth consumers
let _hasConnectionPromise: Promise<void> | null = null;
const ensureHasConnection = () => {
  if (!_hasConnectionPromise) {
    _hasConnectionPromise = HAS.connect()
      .then(() => {
        console.log('has status', HAS.status());
      })
      .catch((err) => {
        console.warn('HAS connection failed, will retry on next use', err);
        _hasConnectionPromise = null; // allow retry on failure
      });
  }
  return _hasConnectionPromise;
};

export const useHiveAuth = () => {
  const intl = useIntl();
  const postLoginActions = usePostLoginActions();

  const pinHash = useAppSelector(selectPin);
  const currentAccount = useAppSelector(selectCurrentAccount);

  const [statusText, setStatusText] = useState('');
  const [status, setStatus] = useState(HiveAuthStatus.INPUT);

  // Ensure HAS relay connection is established (singleton, only connects once)
  useEffect(() => {
    ensureHasConnection();
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

        const uri = await getHiveAuthUri(`auth_req/${encodedData}`, extractPreferredScheme(evt));

        if (uri) {
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

      // NOTE: Don't show posting authority prompt here - it causes crashes
      // The prompt will show naturally when user tries to perform an action
      // The fallback mechanism will handle operations without posting authority

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

      // Ensure HAS connection is established before broadcasting
      await ensureHasConnection();
      const hasStatus = HAS.status();
      console.log('[HiveAuth] Broadcast - HAS status:', hasStatus);

      const username = currentAccount.name ?? currentAccount.username;
      if (!username) {
        throw new Error(
          intl.formatMessage({ id: 'alert.auth_expired' }) ||
            'Account username not found. Please re-login.',
        );
      }

      const _hiveAuthObj: any = {
        username,
        expiry: currentAccount.local.hiveAuthExpiry,
        key: decryptKey(currentAccount.local.hiveAuthKey, getDigitPinCode(pinHash)),
      };

      assert(_hiveAuthObj.key, intl.formatMessage({ id: 'hiveauth.decrypt_fail' }));
      if (_hiveAuthObj.expiry && _hiveAuthObj.expiry <= new Date().getTime()) {
        console.warn('[HiveAuth] Stored session expiry has passed, will re-authenticate if needed');
      }

      const _cdWait = async (evt: any) => {
        console.log('sign wait', evt);

        const uri = await getHiveAuthUri('sign_req', extractPreferredScheme(evt));

        if (uri) {
          setStatusText(intl.formatMessage({ id: 'hiveauth.requesting' }));
          Linking.openURL(uri);
        } else {
          setStatusText(intl.formatMessage({ id: 'hiveauth.not_installed' }));
          setStatus(HiveAuthStatus.ERROR);
        }
      };

      // Infer required key type based on operations (posting vs active)
      const keyType = inferOperationKeyType(opsArray);
      console.log(`[HiveAuth] Broadcasting with ${keyType} authority`, opsArray);

      let res;
      try {
        res = await HAS.broadcast(_hiveAuthObj, keyType, opsArray, _cdWait);
      } catch (broadcastError) {
        if (!isHasNotConnectedError(broadcastError)) {
          throw broadcastError;
        }

        // Account session not found on HAS relay - re-authenticate to re-establish it
        console.log('[HiveAuth] Account not connected on relay, re-authenticating...');
        setStatusText(intl.formatMessage({ id: 'hiveauth.initiating' }));

        // Force fresh WebSocket connection for re-authentication
        _hasConnectionPromise = null;
        await ensureHasConnection();

        const auth: any = {
          username,
          expire: undefined,
          key: _hiveAuthObj.key,
        };

        await HAS.authenticate(auth, APP_META, undefined, async (evt: any) => {
          const { host } = HAS.status();
          const { uuid } = evt;
          const payload = { account: username, uuid, key: auth.key, host };
          const encodedData = btoa(JSON.stringify(payload));

          const uri = await getHiveAuthUri(`auth_req/${encodedData}`, extractPreferredScheme(evt));

          if (uri) {
            setStatusText(intl.formatMessage({ id: 'hiveauth.authenticating' }));
            Linking.openURL(uri);
          } else {
            setStatusText(intl.formatMessage({ id: 'hiveauth.not_installed' }));
            setStatus(HiveAuthStatus.ERROR);
          }
        });

        // Update auth object with token/expiry from re-authentication
        if (auth.token) {
          _hiveAuthObj.token = auth.token;
        }
        if (auth.expire) {
          _hiveAuthObj.expiry = auth.expire;
        }

        // Retry broadcast after successful re-authentication
        console.log('[HiveAuth] Re-authenticated successfully, retrying broadcast...');
        setStatusText(intl.formatMessage({ id: 'hiveauth.requesting' }));
        res = await HAS.broadcast(_hiveAuthObj, keyType, opsArray, _cdWait);
      }

      if (!res?.broadcast) {
        throw new Error(intl.formatMessage({ id: 'hiveauth.transaction_fail' }));
      }

      console.log('broadcast response', res);
      // TODO: hive modal
      // respond back to transfer screen

      setStatus(HiveAuthStatus.SUCCESS);
      setStatusText(intl.formatMessage({ id: 'hiveauth.transaction_success' }));
      await delay(2000);

      return res;
    } catch (error) {
      setStatus(HiveAuthStatus.ERROR);
      setStatusText(intl.formatMessage({ id: error.message || 'hiveauth.transaction_fail' }));

      console.warn('Transaction failed', error);
      Sentry.captureException(error);
      throw error;
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
