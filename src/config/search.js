import axios from 'axios';
import Config from 'react-native-config';

const search = axios.create({
  baseURL: Config.SEARCH_API_URL,
  headers: {
    Authorization: Config.SEARCH_API_TOKEN,
    'Content-Type': 'application/json',
  },
  // timeout: 500,
});

export default search;
