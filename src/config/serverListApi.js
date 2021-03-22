import axios from 'axios';
import Config from 'react-native-config';

const image = axios.create({
  baseURL: Config.SERVER_LIST_API,
  headers: {
    Authorization: Config.SERVER_LIST_API,
    'Content-Type': 'application/json',
  },
});

image.interceptors.request.use((request) => {
  console.log('Starting server list Request', request);
  return request;
});

image.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});

export default image;
