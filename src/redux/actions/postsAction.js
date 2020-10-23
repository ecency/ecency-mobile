import {
  SET_FEED_POSTS,
  FETCH_POSTS,
  FETCH_POSTS_SUCCESS,
  RESET,
  FILTER_SELECTED,
} from '../constants/constants';

export const setFeedPosts = (payload) => ({
  payload,
  type: SET_FEED_POSTS,
});
export const fetchPosts = (payload) => ({
  payload,
  type: FETCH_POSTS,
});
export const fetchPostsSuccess = (payload) => ({
  payload,
  type: FETCH_POSTS_SUCCESS,
});
export const reset = (payload) => ({
  payload,
  type: RESET,
});
export const filterSelected = (payload) => ({
  payload,
  type: FILTER_SELECTED,
});
