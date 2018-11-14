import axios from 'axios';

const api = axios.create({
  baseURL: 'https://us-central1-bubi-7c3f6.cloudfunctions.net/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
