import axios from 'axios';
import Config from 'react-native-config';
import VersionNumber from 'react-native-version-number';

const api = axios.create({
  baseURL: Config.ECENCY_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `${Config.USER_AGENT}/${VersionNumber.appVersion}`,
  },
});

api.interceptors.request.use((request) => {
  console.log('Starting ecency Request', request);
  return request;
});

api.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});

export default api;
