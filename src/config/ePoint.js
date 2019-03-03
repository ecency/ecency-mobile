import axios from 'axios';
import Config from 'react-native-config';

const search = axios.create({
  baseURL: Config.BACKEND_URL,
  headers: {
    'User-Agent': Config.USER_AGENT,
  },
});

export default search;
