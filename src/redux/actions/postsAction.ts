import {
  SET_FEED_POSTS,
  SET_OTHER_POSTS,
  FETCH_POSTS,
  FETCH_POSTS_SUCCESS,
  RESET,
  FILTER_SELECTED,
  SET_INIT_POSTS,
  SET_FEED_SCREEN_FILTERS,
} from '../constants/constants';

export const setFeedPosts = (posts, scrollPosition = 0) => ({
  payload: {
    posts,
    scrollPosition,
  },
  type: SET_FEED_POSTS,
});
export const setInitPosts = (payload) => ({
  payload,
  type: SET_INIT_POSTS,
});
export const setOtherPosts = (posts, scrollPosition = 0) => ({
  payload: {
    posts,
    scrollPosition,
  },
  type: SET_OTHER_POSTS,
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

export const setFeedScreenFilters = (payload: string[]) => ({
  payload,
  type: SET_FEED_SCREEN_FILTERS,
});
