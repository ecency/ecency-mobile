import axios from 'axios';
import Config from 'react-native-config';

function upload(fd, username, signature) {
  const image = axios.create({
    baseURL: `${Config.NEW_IMAGE_API}/${username}/${signature}`, // Config.NEW_IMAGE_API
    headers: {
      Authorization: Config.NEW_IMAGE_API, // Config.NEW_IMAGE_API
      'Content-Type': 'multipart/form-data',
    },
  });
  return image.post('', fd);
}

export { upload };
