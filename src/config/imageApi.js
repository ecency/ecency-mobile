import axios from 'axios';
import Config from 'react-native-config';

function upload(fd, username, signature, uploadProgress) {
  const image = axios.create({
    baseURL: `${Config.NEW_IMAGE_API}/hs/${signature}`, // Config.NEW_IMAGE_API
    headers: {
      Authorization: Config.NEW_IMAGE_API, // Config.NEW_IMAGE_API
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: uploadProgress,
  });

  image.interceptors.request.use((request) => {
    // console.log('Starting image Request', request);
    return request;
  });

  image.interceptors.response.use((response) => {
    // console.log('Response:', response);
    return response;
  });

  return image.post('', fd);
}

export { upload };
