import axios from 'axios';
import Config from 'react-native-config';

const image = axios.create({
  baseURL: Config.OLD_IMAGE_API, // Config.NEW_IMAGE_API
  headers: {
    Authorization: Config.OLD_IMAGE_API, // Config.NEW_IMAGE_API
    'Content-Type': 'multipart/form-data',
  },
});

export default image;
