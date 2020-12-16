import {
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAIL,
  FETCH_SUBSCRIBED_COMMUNITIES,
  FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
  FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
} from '../constants/constants';

const initialState = {
  communities: {
    data: [],
    loading: false,
    error: false,
  },
  subscribedCommunities: {
    data: [],
    loading: false,
    error: false,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_COMMUNITIES:
      return {
        ...state,
        communities: {
          data: [],
          loading: true,
          error: false,
        },
      };
    case FETCH_COMMUNITIES_SUCCESS:
      return {
        ...state,
        communities: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case FETCH_COMMUNITIES_FAIL:
      return {
        ...state,
        communities: {
          data: [],
          loading: false,
          error: action.payload,
        },
      };
    case FETCH_SUBSCRIBED_COMMUNITIES:
      return {
        ...state,
        subscribedCommunities: {
          data: [],
          loading: true,
          error: false,
        },
      };
    case FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS:
      return {
        ...state,
        subscribedCommunities: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case FETCH_SUBSCRIBED_COMMUNITIES_FAIL:
      return {
        ...state,
        subscribedCommunities: {
          data: [],
          loading: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
}
