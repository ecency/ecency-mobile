import * as Sentry from '@sentry/react-native';
import ecencyApi from '../../config/ecencyApi';
import { EcencyUser, UserPoint } from './ecency.types';

/**
 * Records user activty and reward poinsts
 * @param ty points
 * @param bl block number
 * @param tx transaction id
 * @returns
 */
export const userActivity = async (ty: number, tx = '', bl: string | number = '') => {
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
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    Sentry.captureException(error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const claimPoints = async (timeoutMs = 15000) => {
  const startedAt = Date.now();

  try {
    const response = await ecencyApi.post('/private-api/points-claim', undefined, {
      timeout: timeoutMs,
    });

    const duration = Date.now() - startedAt;

    if (duration > 8000) {
      Sentry.captureMessage('points-claim-slow-response', (scope) => {
        scope.setLevel('warning');
        scope.setContext('claimPoints', { duration, timeoutMs });
      });
    }

    return response.data;
  } catch (error) {
    const duration = Date.now() - startedAt;
    const isTimeout = (error as any)?.code === 'ECONNABORTED';

    console.warn('Failed to claim points', error);
    Sentry.captureException(error, (scope) => {
      scope.setContext('claimPoints', { duration, timeoutMs, isTimeout });
    });

    const errorMessage = isTimeout
      ? 'Points claim timed out, please try again.'
      : error.response?.data?.message || error.message;

    throw new Error(errorMessage);
  }
};

export const gameStatusCheck = async (game_type: string) => {
  try {
    const response = await ecencyApi.post('/private-api/get-game', { game_type });
    const _data = response.data;
    if (!_data) {
      throw new Error('Invalid Response Data');
    }
    return _data;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

export const gameClaim = async (game_type: string, key: string) => {
  try {
    const response = await ecencyApi.post('/private-api/post-game', {
      game_type,
      key,
    });
    const _data = response.data;
    if (!_data) {
      throw new Error('Invalid Response Data');
    }
    return _data;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
