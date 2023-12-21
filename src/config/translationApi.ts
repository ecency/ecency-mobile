import axios from 'axios';

const translationApi = axios.create({
  baseURL: 'https://translate.ecency.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default translationApi;
