import axios, { AxiosProgressEvent, AxiosResponse } from 'axios';
import Config from 'react-native-config';
import { SIGN_IMAGE_UNAVAILABLE } from '../constants/imageUpload';

export function upload(
  fd: FormData,
  username: string,
  signature: string | undefined,
  uploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<AxiosResponse> {
  // Without this the URL interpolates to /hs/undefined and the server answers
  // 400 for every upload the account attempts.
  if (!signature) {
    return Promise.reject(new Error(SIGN_IMAGE_UNAVAILABLE));
  }

  const image = axios.create({
    timeout: 120000,
    baseURL: `${Config.NEW_IMAGE_API}/hs/${signature}`,
    headers: {
      Authorization: Config.NEW_IMAGE_API,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: uploadProgress,
  });

  image.interceptors.request.use((request) => request);
  image.interceptors.response.use((response) => response);

  return image.post('', fd);
}
