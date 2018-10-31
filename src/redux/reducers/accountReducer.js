import {
  FETCH_ACCOUNT_FAIL,
  FETCHING_ACCOUNT,
  ADD_OTHER_ACCOUNT,
  UPDATE_CURRENT_ACCOUNT,
} from '../constants/constants';

const initialState = {
  isFetching: null,
  otherAccounts: [],
  currentAccount: {},
  hasError: false,
  errorMessage: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCHING_ACCOUNT:
      return {
        ...state,
        isFetching: true,
        hasError: false,
        errorMessage: null,
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

    case UPDATE_CURRENT_ACCOUNT:
      return {
        ...state,
        currentAccount: action.payload,
        isFetching: false,
        hasError: false,
        errorMessage: null,
      };
    default:
      return state;
  }
}
