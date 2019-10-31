import axios from 'axios';
import Config from 'react-native-config';
import bugsnag from './bugsnag';

const api = axios.create({
  baseURL: Config.BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': Config.USER_AGENT,
  },
});

api.interceptors.response.use(null, error => {
  bugsnag.notify(error);
  return Promise.reject(error);
});

export default api;
