import axios from 'axios';
import Config from 'react-native-config';

const image = axios.create({
  baseURL: Config.IMAGE_API_URL,
  headers: {
    Authorization: Config.IMAGE_API_URL,
    'Content-Type': 'multipart/form-data',
  },
});

export default image;
