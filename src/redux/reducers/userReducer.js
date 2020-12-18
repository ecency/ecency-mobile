import {
  FOLLOW_USER,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAIL,
  UNFOLLOW_USER,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAIL,
} from '../constants/constants';

const initialState = {
  followUser: {
    data: {},
    loading: false,
    error: false,
  },
  unfollowUser: {
    data: {},
    loading: false,
    error: false,
  },
};

export default function (state = initialState, action) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case FOLLOW_USER:
      return {
        ...state,
        followUser: {
          data: {},
          loading: true,
          error: false,
        },
      };
    case FOLLOW_USER_SUCCESS:
      return {
        ...state,
        followUser: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case FOLLOW_USER_FAIL:
      return {
        ...state,
        followUser: {
          data: {},
          loading: false,
          error: action.payload,
        },
      };
    case UNFOLLOW_USER:
      return {
        ...state,
        unfollowUser: {
          data: {},
          loading: true,
          error: false,
        },
      };
    case UNFOLLOW_USER_SUCCESS:
      return {
        ...state,
        unfollowUser: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case UNFOLLOW_USER_FAIL:
      return {
        ...state,
        unfollowUser: {
          data: {},
          loading: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
}
