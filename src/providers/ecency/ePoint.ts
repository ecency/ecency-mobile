import ecencyApi from '../../config/ecencyApi';
import bugsnagInstance from '../../config/bugsnag';
import { EcencyUser, UserPoint } from './ecency.types';
import reactotron from 'reactotron-react-native';

/**
 * Records user activty and reward poinsts
 * @param ty points
 * @param bl block number
 * @param tx transaction id
 * @returns
 */
export const userActivity = async (ty: number, tx: string = '', bl: string | number = '') => {
  try {
    const data: {
      ty: number;
      bl?: string | number;
      tx?: string | number;
    } = { ty };

    if (bl) data.bl = bl;
    if (tx) data.tx = tx;

    const response = await ecencyApi.post('/private-api/usr-activity', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to push user activity point', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

export const getPointsSummary = async (username: string): Promise<EcencyUser> => {
  try {
    const data = { username };
    const response = await ecencyApi.post('/private-api/points', data);
    console.log('returning user points data', response.data);
    return response.data;
  } catch (error) {
    console.warn('Failed to get points', error);
    bugsnagInstance.notify(error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPointsHistory = async (username: string): Promise<UserPoint[]> => {
  try {
    const data = { username };
    const response = await ecencyApi.post('/private-api/point-list', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to get points transactions', error);
    bugsnagInstance.notify(error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const claimPoints = async () => {
  try {
    const response = await ecencyApi.post('/private-api/points-claim');
    return response.data;
  } catch (error) {
    console.warn('Failed to calim points', error);
    bugsnagInstance.notify(error);
    throw new Error(error.response?.data?.message || error.message);
  }
};


/**
 * TOOD:
 * POST /private-api/get-game
 * 
 * params: 
 * game_type:string
 * 
* */
export const gameStatusCheck = async (game_type: string) => {
  try {
    const res = await ecencyApi.post('/private-api/get-game', { game_type });
    reactotron.log(res);
    return res;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * TOOD:
 * POST /private-api/post-game
 * 
 * params: 
 * game_type:string
 * 
 * body:
 * key:string
* */

export const gameClaim = async (game_type: string, key: string) => {
  try {
    const res = await ecencyApi.post('/private-api/post-game', {
      game_type,
      key,
    });
    return res;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};