import { Alert } from 'react-native';
import ePointApi from '../../config/api';

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

export const gameStatusCheck = (username, type) =>
  new Promise((resolve, reject) => {
    ePointApi
      .get(`/game/${username}`, { params: { type } })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const gameClaim = (username, type, key) =>
  new Promise((resolve, reject) => {
    ePointApi
      .post(`/game/${username}?type=${type}`, { key })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });
