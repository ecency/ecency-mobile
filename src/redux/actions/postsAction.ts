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

export const setFeedPosts = (posts: any, scrollPosition = 0) => ({
  payload: {
    posts,
    scrollPosition,
  },
  type: SET_FEED_POSTS,
});
export const setInitPosts = (payload: any) => ({
  payload,
  type: SET_INIT_POSTS,
});
export const setOtherPosts = (posts: any, scrollPosition = 0) => ({
  payload: {
    posts,
    scrollPosition,
  },
  type: SET_OTHER_POSTS,
});

export const fetchPosts = (payload: any) => ({
  payload,
  type: FETCH_POSTS,
});
export const fetchPostsSuccess = (payload: any) => ({
  payload,
  type: FETCH_POSTS_SUCCESS,
});
export const reset = (payload: any) => ({
  payload,
  type: RESET,
});
export const filterSelected = (payload: any) => ({
  payload,
  type: FILTER_SELECTED,
});

export const setFeedScreenFilters = (payload: string[]) => ({
  payload,
  type: SET_FEED_SCREEN_FILTERS,
});
