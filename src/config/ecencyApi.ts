import axios from 'axios';
import Config from 'react-native-config';
import VersionNumber from 'react-native-version-number';
import { get } from 'lodash';
import { store } from '../redux/store/store';
import { getDigitPinCode } from '../providers/hive/dhive';
import { decryptKey } from '../utils/crypto';
import bugsnagInstance from './bugsnag';

export const ECENCY_TERMS_URL = `${Config.ECENCY_BACKEND_API}/terms-of-service`;

const api = axios.create({
  baseURL: Config.ECENCY_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `${Config.USER_AGENT}/${VersionNumber.appVersion}`,
  },
});

api.interceptors.request.use((request) => {
  console.log('Starting ecency Request', request);

  // skip code addition is register and token refresh endpoint is triggered
  if (
    request.url === '/private-api/account-create' ||
    request.url === '/auth-api/hs-token-refresh' ||
    request.url === '/private-api/promoted-entries' ||
    request.url.startsWith('private-api/leaderboard') ||
    request.url.startsWith('/private-api/received-vesting/') ||
    request.url.startsWith('/private-api/referrals/') ||
    request.url.startsWith('/private-api/market-data') ||
    request.url.startsWith('/private-api/comment-history')
  ) {
    return request;
  }

  if (!request.data?.code) {
    // if access code not already set, decrypt access token
    const state = store.getState();
    const token = get(state, 'account.currentAccount.local.accessToken');
    const pin = get(state, 'application.pin');
    const digitPinCode = getDigitPinCode(pin);
    const accessToken = decryptKey(token, digitPinCode);

    if (accessToken) {
      if (!request.data) {
        request.data = {};
      }
      request.data.code = accessToken;
      console.log('Added access token:', accessToken);
    } else {
      const { isLoggedIn } = state.application;
      console.warn('Failed to inject accessToken', `isLoggedIn:${isLoggedIn}`);
      bugsnagInstance.notify(
        new Error(
          `Failed to inject accessToken in ${request.url} call. isLoggedIn:${isLoggedIn}, local.acccessToken:${token}, pin:${pin}`,
        ),
      );
    }
  }

  return request;
});

api.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});

export default api;
