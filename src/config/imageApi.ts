import axios, { AxiosProgressEvent, AxiosResponse } from 'axios';
import Config from 'react-native-config';

export function upload(
  fd: FormData,
  username: string,
  signature: string,
  uploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<AxiosResponse> {
  const image = axios.create({
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
