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
export const followUser = (currentAccount, pin, data, successToastText, failToastText) => {
  return (dispatch) => {
    dispatch({ type: FOLLOW_USER, payload: data });
    followUserReq(currentAccount, pin, data)
      .then((res) => dispatch(followUserSuccess(data, successToastText)))
      .catch((err) => dispatch(followUserFail(err, data, failToastText)));
  };
};

export const followUserSuccess = (data, successToastText) => {
  return (dispatch) => [
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

export const followUserFail = (error, data, failToastText) => {
  return (dispatch) => [
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
export const unfollowUser = (currentAccount, pin, data, successToastText, failToastText) => {
  return (dispatch) => {
    dispatch({ type: UNFOLLOW_USER, payload: data });
    unfollowUserReq(currentAccount, pin, data)
      .then((res) => dispatch(unfollowUserSuccess(data, successToastText)))
      .catch((err) => dispatch(unfollowUserFail(err, data, failToastText)));
  };
};

export const unfollowUserSuccess = (data, successToastText) => {
  return (dispatch) => [
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

export const unfollowUserFail = (error, data, failToastText) => {
  return (dispatch) => [
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
export const fetchLeaderboard = (duration = 'day') => {
  return (dispatch) => {
    dispatch({ type: FETCH_LEADERBOARD });
    getLeaderboard(duration)
      .then((res) => dispatch(fetchLeaderboardSuccess(res)))
      .catch((err) => dispatch(fetchLeaderboardFail(err)));
  };
};

export const fetchLeaderboardSuccess = (payload) => ({
  payload,
  type: FETCH_LEADERBOARD_SUCCESS,
});

export const fetchLeaderboardFail = (payload) => ({
  payload,
  type: FETCH_LEADERBOARD_FAIL,
});
