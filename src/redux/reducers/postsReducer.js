import { SET_FEED_POSTS } from '../constants/constants';

const initialState = {
  feedPosts: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_FEED_POSTS:
      return {
        ...state,
        feedPosts: action.payload,
      };
    default:
      return state;
  }
}
