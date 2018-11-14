import axios from 'axios';
import Config from 'react-native-config';

const api = axios.create({
  baseURL: Config.BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
