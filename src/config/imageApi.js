import axios from 'axios';
import Config from 'react-native-config';

const image = axios.create({
  baseURL: 'https://img.esteem.ws/backend.php',
  headers: {
    Authorization: 'https://img.esteem.ws/backend.php',
    'Content-Type': 'multipart/form-data',
  },
});

export default image;

// New image service
// import axios from 'axios';
// import Config from 'react-native-config';

// const image = axios.create({
//   baseURL: 'https://img.esteem.app/',
//   headers: {
//     Authorization: 'https://img.esteem.app/',
//     'Content-Type': 'multipart/form-data',
//   },
// });

// export default image;
