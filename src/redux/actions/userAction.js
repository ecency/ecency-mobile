import {
  FOLLOW_USER,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAIL,
  UNFOLLOW_USER,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAIL,
} from '../constants/constants';

export const followUser = (payload) => ({
  payload,
  type: FOLLOW_USER,
});

export const unfollowUser = (payload) => ({
  payload,
  type: UNFOLLOW_USER,
});
