import {
  FETCH_ACCOUNT_FAIL,
  FETCHING_ACCOUNT,
  ADD_OTHER_ACCOUNT,
  UPDATE_CURRENT_ACCOUNT,
  UPDATE_UNREAD_ACTIVITY_COUNT,
  REMOVE_OTHER_ACCOUNT,
  LOGOUT_FAIL,
  SET_PIN_CODE,
  SET_GLOBAL_PROPS,
} from '../constants/constants';

const initialState = {
  isFetching: null,
  otherAccounts: [],
  currentAccount: {},
  hasError: false,
  errorMessage: null,
  isLogingOut: false,
  pin: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCHING_ACCOUNT:
      return {
        ...state,
        isFetching: true,
        hasError: false,
        errorMessage: null,
      };

    case SET_GLOBAL_PROPS:
      return {
        ...state,
        globalProps: action.payload,
      };

    case FETCH_ACCOUNT_FAIL:
      return {
        ...state,
        isFetching: false,
        hasError: true,
        errorMessage: action.payload,
      };

    case ADD_OTHER_ACCOUNT:
      return {
        ...state,
        otherAccounts: [...state.otherAccounts, action.payload],
        isFetching: false,
        hasError: false,
        errorMessage: null,
      };

    case REMOVE_OTHER_ACCOUNT:
      return {
        ...state,
        otherAccounts: state.otherAccounts.filter(item => item.username !== action.payload),
      };

    case UPDATE_CURRENT_ACCOUNT:
      return {
        ...state,
        currentAccount: action.payload,
        isFetching: false,
        hasError: false,
        errorMessage: null,
      };

    case UPDATE_UNREAD_ACTIVITY_COUNT:
      return {
        ...state,
        currentAccount: {
          ...state.currentAccount,
          unread_activity_count: action.payload,
        },
        isFetching: false,
        hasError: false,
        errorMessage: null,
      };

    case LOGOUT_FAIL:
      return {
        ...state,
        isLogingOut: true,
      };

    case SET_PIN_CODE:
      return {
        ...state,
        pin: action.payload,
      };

    default:
      return state;
  }
}
