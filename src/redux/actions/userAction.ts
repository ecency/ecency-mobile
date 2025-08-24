import { Dispatch } from 'redux';
import {
  FOLLOW_USER,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAIL,
  UNFOLLOW_USER,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAIL,
  TOAST_NOTIFICATION,
  FETCH_LEADERBOARD,
  FETCH_LEADERBOARD_SUCCESS,
  FETCH_LEADERBOARD_FAIL,
} from '../constants/constants';

import {
  followUser as followUserReq,
  unfollowUser as unfollowUserReq,
} from '../../providers/hive/dhive';
import { getLeaderboard } from '../../providers/ecency/ecency';

// Follow User
export const followUser = (
  currentAccount: any,
  pin: any,
  data: any,
  successToastText: string,
  failToastText: string,
) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: FOLLOW_USER, payload: data });
    followUserReq(currentAccount, pin, data)
      .then(() => dispatch(followUserSuccess(data, successToastText)))
      .catch((err) => dispatch(followUserFail(err, data, failToastText)));
  };
};

export const followUserSuccess = (data: any, successToastText: string) => {
  return (dispatch: Dispatch) => [
    dispatch({
      payload: data,
      type: FOLLOW_USER_SUCCESS,
    }),
    dispatch({
      payload: successToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

export const followUserFail = (error: any, data: any, failToastText: string) => {
  return (dispatch: Dispatch) => [
    dispatch({
      payload: data,
      type: FOLLOW_USER_FAIL,
    }),
    dispatch({
      payload: failToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

// Unfollow User
export const unfollowUser = (
  currentAccount: any,
  pin: any,
  data: any,
  successToastText: string,
  failToastText: string,
) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: UNFOLLOW_USER, payload: data });
    unfollowUserReq(currentAccount, pin, data)
      .then(() => dispatch(unfollowUserSuccess(data, successToastText)))
      .catch((err) => dispatch(unfollowUserFail(err, data, failToastText)));
  };
};

export const unfollowUserSuccess = (data: any, successToastText: string) => {
  return (dispatch: Dispatch) => [
    dispatch({
      payload: data,
      type: UNFOLLOW_USER_SUCCESS,
    }),
    dispatch({
      payload: successToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

export const unfollowUserFail = (error: any, data: any, failToastText: string) => {
  return (dispatch: Dispatch) => [
    dispatch({
      payload: data,
      type: UNFOLLOW_USER_FAIL,
    }),
    dispatch({
      payload: failToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

// Fetch Leaderboard
export const fetchLeaderboard = (duration: string = 'day') => {
  return (dispatch: Dispatch) => {
    dispatch({ type: FETCH_LEADERBOARD });
    getLeaderboard(duration)
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
