import {
  FOLLOW_USER,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAIL,
  UNFOLLOW_USER,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAIL,
  TOAST_NOTIFICATION,
} from '../constants/constants';

import { followUser as followUserReq } from '../../providers/hive/dhive';

export const followUser = (currentAccount, pin, data) => {
  return (dispatch) => {
    dispatch({
      type: FOLLOW_USER,
    });
    console.log('followUser', currentAccount, pin, data);
    followUserReq(currentAccount, pin, data)
      .then((res) =>
        dispatch({
          payload: res,
          type: FOLLOW_USER_SUCCESS,
        }),
      )
      .catch((err) =>
        dispatch({
          payload: err,
          type: FOLLOW_USER_FAIL,
        }),
      );
  };
};

export const followUserSuccess = (payload) => {
  return (dispatch) => {
    // dispatch({
    //   payload,
    //   type: FOLLOW_USER_SUCCESS,
    // });
    // dispatch({
    //   payload: 'done',
    //   type: TOAST_NOTIFICATION,
    // });
    // toastNotification(
    //   intl.formatMessage({
    //     //id: isFollowing ? 'alert.success_unfollow' : 'alert.success_follow',
    //   }),
    // ),
  };
};

export const followUserFail = (payload) => ({
  payload,
  type: FOLLOW_USER_FAIL,
});

export const unfollowUser = ({ currentAccount, pin, data }) => ({
  type: UNFOLLOW_USER,
});

export const unfollowUserSuccess = (payload) => ({
  payload,
  type: UNFOLLOW_USER_SUCCESS,
});

export const funollowUserFail = (payload) => ({
  payload,
  type: UNFOLLOW_USER_FAIL,
});
