import axios from 'axios';
import Config from 'react-native-config';

const image = axios.create({
  baseURL: Config.SERVER_LIST_API,
  headers: {
    Authorization: Config.SERVER_LIST_API,
    'Content-Type': 'application/json',
  },
});

export default image;
