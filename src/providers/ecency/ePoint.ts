import { getPointsQueryOptions } from '@ecency/sdk';
import { captureException, captureMessage } from '../../utils/sentryUtils';
import { isAxiosTransportError } from '../../config/axiosTimeout';
import ecencyApi from '../../config/ecencyApi';
import { getQueryClient } from '../queries';
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
    // Transport failures are not reported. The caller retries this mutation and
    // then parks it in redux to replay later, so a broken path already recovers
    // on its own; reporting each attempt would send three identical events per
    // user action for a result the user never sees. Anything the server actually
    // answered with is still reported.
    if (!isAxiosTransportError(error)) {
      captureException(error);
    }
    throw error;
  }
};

export const getPointsSummary = async (username: string): Promise<EcencyUser | null> => {
  try {
    const queryClient = getQueryClient();
    const response = await queryClient.fetchQuery(getPointsQueryOptions(username, 0));
    return response as unknown as EcencyUser;
  } catch (error) {
    // 404 is expected for accounts that have not yet been provisioned in the points system
    if (/\b404\b/.test((error as any)?.message || '') || (error as any)?.response?.status === 404) {
      return null;
    }
    console.warn('Failed to get points', error);
    captureException(error);
    throw new Error((error as any).response?.data?.message || (error as any).message);
  }
};

export const getPointsHistory = async (
  username: string,
  type: number = 0,
): Promise<UserPoint[]> => {
  try {
    const data = { username, type };
    const response = await ecencyApi.post('/private-api/point-list', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to get points transactions', error);
    captureException(error);
    throw new Error((error as any).response?.data?.message || (error as any).message);
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
      captureMessage('points-claim-slow-response', (scope) => {
        scope.setLevel('warning');
        scope.setContext('claimPoints', { duration, timeoutMs });
      });
    }

    return response.data;
  } catch (error) {
    const duration = Date.now() - startedAt;
    const isTimeout = (error as any)?.code === 'ECONNABORTED';

    console.warn('Failed to claim points', error);
    captureException(error, (scope) => {
      scope.setContext('claimPoints', { duration, timeoutMs, isTimeout });
    });

    const errorMessage = isTimeout
      ? 'Points claim timed out, please try again.'
      : (error as any).response?.data?.message || (error as any).message;

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
    captureException(error);
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
    captureException(error);
    throw error;
  }
};
