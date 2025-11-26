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
