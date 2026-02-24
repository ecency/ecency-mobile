import { Dispatch } from 'redux';
import { getDiscoverLeaderboardQueryOptions, LeaderBoardDuration } from '@ecency/sdk';
import {
  FETCH_LEADERBOARD,
  FETCH_LEADERBOARD_SUCCESS,
  FETCH_LEADERBOARD_FAIL,
} from '../constants/constants';

import { getQueryClient } from '../../providers/queries';

// Fetch Leaderboard
export const fetchLeaderboard = (duration: LeaderBoardDuration = 'day') => {
  return (dispatch: Dispatch) => {
    dispatch({ type: FETCH_LEADERBOARD });
    const queryClient = getQueryClient();
    queryClient
      .fetchQuery(getDiscoverLeaderboardQueryOptions(duration))
      .then((res) => dispatch(fetchLeaderboardSuccess(res)))
      .catch((err) => dispatch(fetchLeaderboardFail(err)));
  };
};

export const fetchLeaderboardSuccess = (payload: any) => ({
  payload,
  type: FETCH_LEADERBOARD_SUCCESS,
});

export const fetchLeaderboardFail = (payload: any) => ({
  payload,
  type: FETCH_LEADERBOARD_FAIL,
});
