import {
  SET_FEED_POSTS,
  SET_OTHER_POSTS,
  SET_INIT_POSTS,
  FILTER_SELECTED,
  FETCH_POSTS,
  FETCH_POSTS_SUCCESS,
  RESET,
  UPDATE_LOCAL_VOTE_MAP,
  RESET_LOCAL_VOTE_MAP,
} from '../constants/constants';

const initialState = {
  feedPosts: [],
  otherPosts: [],
  initPosts: [],
  posts: [],
  loading: false,
  selectedFilterValue: '',
  localVoteMap: new Map(),
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_FEED_POSTS:
      return {
        ...state,
        feedPosts: action.payload.posts,
        feedScrollPosition: action.payload.scrollPosition,
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
        otherPosts: action.payload.posts,
        otherScrollPosition: action.payload.scrollPosition,
        posts: action.payload,
      };
    case UPDATE_LOCAL_VOTE_MAP:
      const { postId, localVote } = action.payload;
      const voteMap = state.localVoteMap || new Map();
      voteMap[postId] = localVote;
      return {
        ...state,
        localVoteMap: voteMap,
      };

    case RESET_LOCAL_VOTE_MAP:
      return {
        ...state,
        localVoteMap: new Map(),
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
