import { Alert } from 'react-native';
import ePointApi from '../../config/api';
import ecencyApi from '../../config/ecencyApi';
import bugsnagInstance from '../../config/bugsnag';


/**
 * Records user activty and reward poinsts
 * @param ty points
 * @param bl block number
 * @param tx transaction id
 * @returns 
 */
export const userActivity = async (ty:number, bl:string|number = '', tx:string = '') => {
  try{
    const data: {

      ty: number;
      bl?: string | number;
      tx?: string | number;
    } = {ty};

    if (bl) data.bl = bl;
    if (tx) data.tx = tx;

    const response = await ecencyApi.post('/private-api/usr-activity', data)
    return response.data;
  }catch(error){
    console.warn("Failed to push user activity point", error);
    bugsnagInstance.notify(error)
  }
}


export const getUser = (username) =>
  new Promise((resolve) => {
    ePointApi
      .get(`/users/${username}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  });

export const getUserPoints = (username) =>
  new Promise((resolve) => {
    ePointApi
      .get(`/users/${username}/points`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  });

export const claim = (username) =>
  new Promise((resolve, reject) => {
    ePointApi
      .put('/claim', {
        us: `${username}`,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const gameStatusCheck = (username, type) =>
  new Promise((resolve, reject) => {
    ePointApi
      .get(`/game/${username}`, {
        params: {
          type,
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const gameClaim = (username, type, key) =>
  new Promise((resolve, reject) => {
    ePointApi
      .post(`/game/${username}?type=${type}`, {
        key,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
