import {
  SET_FEED_POSTS,
  SET_OTHER_POSTS,
  SET_INIT_POSTS,
  FILTER_SELECTED,
  FETCH_POSTS,
  FETCH_POSTS_SUCCESS,
  RESET,
} from '../constants/constants';

const initialState = {
  feedPosts: [],
  otherPosts: [],
  initPosts: [],
  posts: [],
  loading: false,
  selectedFilterValue: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_FEED_POSTS:
      return {
        ...state,
        feedPosts: action.payload,
        posts: action.payload,
      };
    case SET_INIT_POSTS:
      return {
        ...state,
        initPosts: action.payload,
      };
    case SET_OTHER_POSTS:
      return {
        ...state,
        otherPosts: action.payload,
        posts: action.payload,
      };
    case FILTER_SELECTED: {
      return {
        ...state,
        selectedFilterValue: action.payload,
      };
    }
    case FETCH_POSTS: {
      return {
        ...state,
        loading: true,
        feedPosts: null,
        posts: null,
      };
    }
    case FETCH_POSTS_SUCCESS: {
      return {
        ...state,
        loading: false,
        feedPosts: action.payload,
        posts: action.payload,
      };
    }
    case RESET: {
      return initialState;
    }
    default:
      return state;
  }
}
