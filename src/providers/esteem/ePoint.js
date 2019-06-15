import { Alert } from 'react-native';
import { Client, PrivateKey } from 'dsteem';
import ePointApi from '../../config/ePoint';

// Utils
import { decryptKey } from '../../utils/crypto';

// const client = new Client(getItem('server', 'https://api.steemit.com'));

export const userActivity = (us, ty, bl = '', tx = '') =>
  new Promise(resolve => {
    const params = { us, ty };

    if (bl) {
      params.bl = bl;
    }

    if (tx) {
      params.tx = tx;
    }

    ePointApi
      .post('/usr-activity', params)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  });

export const transfer = (sender, receiver, amount) =>
  new Promise(resolve => {
    ePointApi
      .post('/transfer', {
        se: sender,
        re: receiver,
        am: amount,
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  });

export const getUser = username =>
  new Promise(resolve => {
    ePointApi
      .get(`/users/${username}`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  });

export const getUserPoints = username =>
  new Promise(resolve => {
    ePointApi
      .get(`/users/${username}/points`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  });

export const claim = username =>
  new Promise((resolve, reject) => {
    ePointApi
      .put('/claim', {
        us: `${username}`,
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });
