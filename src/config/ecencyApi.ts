import axios from 'axios';
import Config from 'react-native-config';
import VersionNumber from 'react-native-version-number';
import { get } from 'lodash';
import { captureException } from '../utils/sentryUtils';
import { store } from '../redux/store/store';
import { getDigitPinCode } from '../providers/hive/hive';
import { decryptKey } from '../utils/crypto';
import { selectIsLoggedIn } from '../redux/selectors';
import { FIRST_PARTY_TIMEOUT_MS } from '../utils/networkTimeout';
import { isAxiosTimeoutError, stampRequestStart } from './axiosTimeout';

export const ECENCY_TERMS_URL = `${Config.ECENCY_BACKEND_API}/terms-of-service`;

const ecencyApi = axios.create({
  baseURL: Config.ECENCY_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `${Config.USER_AGENT}/${VersionNumber.appVersion}`,
  },
  // Axios does not go through the global fetch wrapper: with XMLHttpRequest
  // defined it picks its xhr adapter, and an instance with no `timeout` inherits
  // 0, which React Native passes through as "no deadline". A request that is
  // accepted and never answered then never settles, and it holds one of the five
  // concurrent slots the platform HTTP client allows per host for the life of the
  // process. Five of those lock out every later call to this host, fetch included.
  //
  // Same budget as the fetch deadline for this host, and for the same reasons;
  // per-request overrides win where an endpoint is not idempotent.
  timeout: FIRST_PARTY_TIMEOUT_MS,
});

ecencyApi.interceptors.request.use((request) => {
  // console.log(`Starting ecency Request`, request);

  // Stamp the start so the response interceptor can recognise a timeout on
  // Android, where the platform reports one as a generic transport failure.
  stampRequestStart(request);

  // skip code addition is register and token refresh endpoint is triggered
  if (
    request.url === '/private-api/account-create' ||
    request.url === '/auth-api/hs-token-refresh' ||
    request.url === '/private-api/promoted-entries' ||
    request.url === '/private-api/announcements' ||
    request.url === '/private-api/public/bots' ||
    request.url === '/private-api/proposal/active' ||
    request.url?.startsWith('private-api/leaderboard') ||
    request.url?.startsWith('/private-api/received-vesting/') ||
    request.url?.startsWith('/private-api/referrals/') ||
    request.url?.startsWith('/private-api/market-data') ||
    request.url?.startsWith('/private-api/comment-history') ||
    request.url?.startsWith('/private-api/engine')
  ) {
    return request;
  }

  if (!request.data?.code) {
    // if access code not already set, decrypt access token
    const state = store.getState();
    const currentAccount = get(state, 'account.currentAccount');
    const token = get(currentAccount, 'local.accessToken');
    const pin = get(state, 'application.pin');
    const digitPinCode = getDigitPinCode(pin);
    const accessToken = decryptKey(token, digitPinCode);

    if (accessToken) {
      if (!request.data) {
        request.data = {};
      }
      request.data.code = accessToken;
    } else if (selectIsLoggedIn(state)) {
      const errMsg = 'Failed to inject accessToken';
      console.warn(errMsg);
      captureException(new Error(errMsg), (scope) => {
        scope.setUser({ username: currentAccount.name });
        scope.setTag('context', 'ecency_api_interceptor');
        scope.setContext('meta', {
          url: request.url,
          accessTokenExist: !!token,
        });
      });
    }
  }

  return request;
});

ecencyApi.interceptors.response.use(
  (response) => {
    // console.log('Response:', response);
    return response;
  },
  (error) => {
    // Rename so callers, the retry policy and the error view can tell "the
    // network never answered" from "the server said no". `error.code` is
    // deliberately left alone: call sites already branch on it. `error.message`
    // is left alone too, because it is surfaced to users.
    if (isAxiosTimeoutError(error)) {
      error.name = 'TimeoutError';
    }
    return Promise.reject(error);
  },
);

export default ecencyApi;
