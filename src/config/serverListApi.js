import axios from 'axios';
import Config from 'react-native-config';

const slist = axios.create({
  baseURL: Config.SERVER_LIST_API,
  headers: {
    Authorization: Config.SERVER_LIST_API,
    'Content-Type': 'application/json',
  },
});

slist.interceptors.request.use((request) => {
  console.log('Starting server list Request', request);
  return request;
});

slist.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});

export default slist;
