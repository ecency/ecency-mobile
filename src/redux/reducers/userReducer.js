import {
  FOLLOW_USER,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAIL,
  UNFOLLOW_USER,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAIL,
  FETCH_LEADERBOARD,
  FETCH_LEADERBOARD_SUCCESS,
  FETCH_LEADERBOARD_FAIL,
} from '../constants/constants';

const initialState = {
  followingUsersInFeedScreen: {
    // ['username']: {
    //  isFollowing: false,
    //  loading: false,
    //  error: false
    // }
  },
  leaderboard: {
    data: [],
    loading: false,
    error: false,
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case FOLLOW_USER:
      return {
        ...state,
        followingUsersInFeedScreen: {
          ...state.followingUsersInFeedScreen,
          [action.payload.following]: {
            isFollowing: false,
            loading: true,
            error: false,
          },
        },
      };
    case FOLLOW_USER_SUCCESS:
      return {
        ...state,
        followingUsersInFeedScreen: {
          ...state.followingUsersInFeedScreen,
          [action.payload.following]: {
            isFollowing: true,
            loading: false,
            error: false,
          },
        },
      };
    case FOLLOW_USER_FAIL:
      return {
        ...state,
        followingUsersInFeedScreen: {
          ...state.followingUsersInFeedScreen,
          [action.payload.following]: {
            isFollowing: false,
            loading: false,
            error: true,
          },
        },
      };
    case UNFOLLOW_USER:
      return {
        ...state,
        followingUsersInFeedScreen: {
          ...state.followingUsersInFeedScreen,
          [action.payload.following]: {
            isFollowing: true,
            loading: true,
            error: false,
          },
        },
      };
    case UNFOLLOW_USER_SUCCESS:
      return {
        ...state,
        followingUsersInFeedScreen: {
          ...state.followingUsersInFeedScreen,
          [action.payload.following]: {
            isFollowing: false,
            loading: false,
            error: false,
          },
        },
      };
    case UNFOLLOW_USER_FAIL:
      return {
        ...state,
        followingUsersInFeedScreen: {
          ...state.followingUsersInFeedScreen,
          [action.payload.following]: {
            isFollowing: true,
            loading: false,
            error: true,
          },
        },
      };
    case FETCH_LEADERBOARD:
      return {
        ...state,
        leaderboard: {
          data: [],
          loading: true,
          error: false,
        },
      };
    case FETCH_LEADERBOARD_SUCCESS:
      return {
        ...state,
        leaderboard: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case FETCH_LEADERBOARD_FAIL:
      return {
        ...state,
        leaderboard: {
          data: [],
          loading: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
};

export default userReducer;
