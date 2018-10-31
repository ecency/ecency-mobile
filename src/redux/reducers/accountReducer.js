import {
  ADD_NEW_ACCOUNT,
  UPDATE_ACCOUNT_DATA,
  REMOVE_ACCOUNT_DATA,
  FETCH_ACCOUNT_FAIL,
  FETCHING_ACCOUNT,
  ADD_OTHER_ACCOUNT,
  UPDATE_CURRENT_ACCOUNT,
} from '../constants/constants';

const initialState = {
  isFetching: null,
  otherAccounts: [],
  currentAccount: {},
  data: {
    accounts: [],
    currentAccountId: null,
  },
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
    case ADD_NEW_ACCOUNT:
      return {
        ...state,
        isFetching: false,
        data: {
          accounts: [...state.data.accounts, action.payload],
          currentAccountId: action.payload.id,
        },
        hasError: false,
        errorMessage: null,
      };

    case UPDATE_ACCOUNT_DATA:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload,
        hasError: false,
        errorMessage: null,
      });

    case REMOVE_ACCOUNT_DATA:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.payload,
        hasError: false,
        errorMessage: null,
      });

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
