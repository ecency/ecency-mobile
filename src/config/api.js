import axios from 'axios';
import Config from 'react-native-config';

const api = axios.create({
  baseURL: Config.BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': Config.USER_AGENT,
  },
});

export default api;
