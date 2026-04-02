import axios from 'axios';
import Config from 'react-native-config';
import VersionNumber from 'react-native-version-number';

const chatApi = axios.create({
  baseURL: Config.ECENCY_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `${Config.USER_AGENT}/${VersionNumber.appVersion}`,
  },
  withCredentials: true,
});

/**
 * Track which user the current token belongs to. This prevents
 * multi-account race conditions where one account's bootstrap
 * overwrites another's token on the shared axios instance.
 */
let _currentTokenOwner: string | null = null;

/**
 * Store the Mattermost personal access token so every subsequent
 * request carries it in the X-MM-Token header. This avoids reliance
 * on the httpOnly cookie which can be unreliable on React Native
 * (async cookie-jar updates cause race conditions on cold start).
 *
 * @param token - The PAT to set, or null to clear
 * @param username - The Hive username this token belongs to
 */
export const setChatApiToken = (token: string | null, username?: string) => {
  if (token && username) {
    chatApi.defaults.headers.common['X-MM-Token'] = token;
    _currentTokenOwner = username;
  } else {
    delete chatApi.defaults.headers.common['X-MM-Token'];
    _currentTokenOwner = null;
  }
};

/**
 * Returns the username that owns the currently set token,
 * or null if no token is set.
 */
export const getChatApiTokenOwner = (): string | null => _currentTokenOwner;

chatApi.interceptors.request.use((request) => request);
chatApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as {
        message?: string;
        error?: string | { message?: string };
      };
      const responseMessage =
        payload?.message ||
        (typeof payload?.error === 'string' ? payload.error : payload?.error?.message);

      if (responseMessage) {
        error.message = responseMessage;
      } else if (error.response?.status) {
        error.message = `Request failed (${error.response.status})`;
      }
    }

    return Promise.reject(error);
  },
);

export default chatApi;
