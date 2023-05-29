import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com';
const PATH_API = 'api';
const API_VERSION = 'v3';

// documentation reference: https://www.coingecko.com/en/api/documentation

const coingeckoApi = axios.create({
  baseURL: `${BASE_URL}/${PATH_API}/${API_VERSION}`,
});

export default coingeckoApi;
