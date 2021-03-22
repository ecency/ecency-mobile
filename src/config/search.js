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

search.interceptors.request.use((request) => {
  console.log('Starting search Request', request);
  return request;
});

search.interceptors.response.use((response) => {
  console.log('Response:', response);
  return response;
});

export default search;
