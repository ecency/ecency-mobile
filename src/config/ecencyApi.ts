import axios from 'axios';
import Config from 'react-native-config';
import VersionNumber from 'react-native-version-number';
import { get } from 'lodash';
import { store } from '../redux/store/store';

const api = axios.create({
  baseURL: Config.ECENCY_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `${Config.USER_AGENT}/${VersionNumber.appVersion}`,
  },
});

api.interceptors.request.use((request) => {
  console.log('Starting ecency Request', request);
  
  //skip code addition is register endpoint is triggered
  if(request.url === '/signup/account-create'){
    return request
  }

  const state = store.getState();
  const accessToken = get(state, 'account.currentAccount.accessToken');
  if (accessToken) {
    if (!request.data) {
      request.data = {};
    }
    request.data.code = accessToken;
    console.log('Added access token:', accessToken);
  } else {
    console.warn('No access token available');
  }

  return request;
});

api.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});

export default api;
