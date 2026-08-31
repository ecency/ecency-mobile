import axios from 'axios';

import { DEFAULT_TIMEOUT_MS } from '../utils/networkTimeout';

const translationApi = axios.create({
  baseURL: 'https://translate.ecency.com',
  headers: {
    'Content-Type': 'application/json',
  },
  // Translation is user-initiated and shows its own spinner, so it needs a
  // deadline more than most: without one the spinner has no exit. Kept at the
  // looser third-party budget rather than the first-party one, because the work
  // behind this endpoint legitimately takes longer than a plain API read.
  timeout: DEFAULT_TIMEOUT_MS,
});

export default translationApi;
