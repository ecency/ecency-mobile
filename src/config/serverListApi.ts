import axios, { AxiosInstance } from 'axios';
import Config from 'react-native-config';

const slist: AxiosInstance = axios.create({
  baseURL: Config.SERVER_LIST_API,
  headers: {
    Authorization: Config.SERVER_LIST_API,
    'Content-Type': 'application/json',
  },
});

slist.interceptors.request.use((request) => request);
slist.interceptors.response.use((response) => response);

export default slist;
