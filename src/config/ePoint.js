import axios from 'axios';
import Config from 'react-native-config';

const ePoint = axios.create({
  baseURL: Config.BACKEND_URL,
  headers: {
    'User-Agent': Config.USER_AGENT,
  },
});

export default ePoint;
