import axios from 'axios';

import { DEFAULT_TIMEOUT_MS } from '../utils/networkTimeout';

const githubApi = axios.create({
  baseURL: 'https://api.github.com/repos/ecency/vision-mobile/',
  // Only used for the update check on launch. Nothing waits on it, so a stalled
  // call would sit open unnoticed for the life of the process; axios sets no
  // deadline of its own and does not go through the global fetch wrapper.
  timeout: DEFAULT_TIMEOUT_MS,
});

export default githubApi;
