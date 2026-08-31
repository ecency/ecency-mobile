import axios from 'axios';

import { DEFAULT_TIMEOUT_MS } from '../utils/networkTimeout';

const BASE_URL = 'https://api.coingecko.com';
const PATH_API = 'api';
const API_VERSION = 'v3';

// documentation reference: https://www.coingecko.com/en/api/documentation

const coingeckoApi = axios.create({
  baseURL: `${BASE_URL}/${PATH_API}/${API_VERSION}`,
  // Axios bypasses the global fetch deadline (it uses its xhr adapter) and
  // defaults to no timeout of its own, so without this a stalled market-data
  // request never settles. Market data is decoration on the wallet screen; it
  // must never be the reason a request slot stays occupied.
  timeout: DEFAULT_TIMEOUT_MS,
});

export default coingeckoApi;
