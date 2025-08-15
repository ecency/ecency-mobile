import axios from 'axios';
import Config from 'react-native-config';
import VersionNumber from 'react-native-version-number';
import { get } from 'lodash';
import * as Sentry from '@sentry/react-native';
import { store } from '../redux/store/store';
import { getDigitPinCode } from '../providers/hive/dhive';
import { decryptKey } from '../utils/crypto';

export const ECENCY_TERMS_URL = `${Config.ECENCY_BACKEND_API}/terms-of-service`;

const ecencyApi = axios.create({
  baseURL: Config.ECENCY_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `${Config.USER_AGENT}/${VersionNumber.appVersion}`,
  },
});

ecencyApi.interceptors.request.use((request) => {
  // console.log(`Starting ecency Request`, request);

  // skip code addition is register and token refresh endpoint is triggered
  if (
    request.url === '/private-api/account-create' ||
    request.url === '/auth-api/hs-token-refresh' ||
    request.url === '/private-api/promoted-entries' ||
    request.url === '/private-api/announcements' ||
    request.url === '/private-api/public/bots' ||
    request.url === '/private-api/proposal/active' ||
    request.url.startsWith('private-api/leaderboard') ||
    request.url.startsWith('/private-api/received-vesting/') ||
    request.url.startsWith('/private-api/referrals/') ||
    request.url.startsWith('/private-api/market-data') ||
    request.url.startsWith('/private-api/comment-history') ||
    request.url.startsWith('/private-api/engine')
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
      console.log('Added access token:', accessToken);
    } else if (state.application.isLoggedIn) {
      const errMsg = 'Failed to inject accessToken';
      console.warn(errMsg);
      Sentry.captureException(new Error(errMsg), (scope) => {
        scope.setUser({ username: currentAccount.username });
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

ecencyApi.interceptors.response.use((response) => {
  // console.log('Response:', response);
  return response;
});

export default ecencyApi;
