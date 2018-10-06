import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAIL,
  LOGOUT,
  IS_LOGGED_IN,
} from '../constants/constants';

const initialState = {
  isFetching: null,
  data: [],
  hasError: false,
  errorMessage: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_USER:
      return Object.assign({}, state, {
        isFetching: true,
        data: null,
        hasError: false,
        errorMessage: null,
      });

    case FETCH_USER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload,
        hasError: false,
        errorMessage: null,
      });

    case FETCH_USER_FAIL:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload,
        hasError: true,
        errorMessage: action.err,
      });

    case IS_LOGGED_IN:
      return Object.assign({}, state, {
        isLoggedIn: action.payload,
      });

    case LOGOUT:
      return initialState;

    default:
      return state;
  }
}
