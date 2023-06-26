import get from 'lodash/get';

import {
  FETCH_ACCOUNT_FAIL,
  FETCHING_ACCOUNT,
  ADD_OTHER_ACCOUNT,
  UPDATE_OTHER_ACCOUNT,
  UPDATE_CURRENT_ACCOUNT,
  UPDATE_UNREAD_ACTIVITY_COUNT,
  REMOVE_OTHER_ACCOUNT,
  REMOVE_ALL_OTHER_ACCOUNT,
  LOGOUT_FAIL,
  SET_GLOBAL_PROPS,
} from '../constants/constants';

export interface GlobalProps {
  hivePerMVests: number;
  base: number;
  quote: number;
  fundRecentClaims: number;
  fundRewardBalance: number;
  hbdPrintRate: number;
}

interface AccountState {
  isFetching: boolean;
  currentAccount: any;
  otherAccounts: any[];
  hasError: boolean;
  errorMessage: string;
  isLogingOut: boolean;
  globalProps: GlobalProps | null;
}

const initialState: AccountState = {
  isFetching: null,
  otherAccounts: [],
  currentAccount: {},
  hasError: false,
  errorMessage: null,
  isLogingOut: false,
  globalProps: null,
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
        otherAccounts: state.otherAccounts.some(
          ({ username }) => username === get(action.payload, 'username'),
        )
          ? // replace account data if it already exists
            [
              ...state.otherAccounts.filter((item) => item.username !== action.payload.username),
              action.payload,
            ]
          : // add new account entry if it does not already exist
            [...state.otherAccounts, action.payload],
        isFetching: false,
        hasError: false,
        errorMessage: null,
      };

    case UPDATE_OTHER_ACCOUNT:
      return {
        ...state,
        otherAccounts: [
          ...state.otherAccounts.filter((item) => item.username !== action.payload.username),
          action.payload,
        ],
      };

    case REMOVE_OTHER_ACCOUNT:
      return {
        ...state,
        otherAccounts: state.otherAccounts.filter((item) => item.username !== action.payload),
      };

    case REMOVE_ALL_OTHER_ACCOUNT:
      return {
        ...state,
        otherAccounts: [],
      };

    case UPDATE_CURRENT_ACCOUNT:
      return Object.assign({}, state, {
        currentAccount: action.payload,
        isFetching: false,
        hasError: false,
        errorMessage: null,
      });

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

    default:
      return state;
  }
}
