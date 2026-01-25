import { getQueryClient, getDynamicPropsQueryOptions, type DynamicProps } from '@ecency/sdk';
import {
  ADD_OTHER_ACCOUNT,
  FETCH_ACCOUNT_FAIL,
  REMOVE_OTHER_ACCOUNT,
  REMOVE_ALL_OTHER_ACCOUNT,
  SET_GLOBAL_PROPS,
  UPDATE_CURRENT_ACCOUNT,
  UPDATE_UNREAD_ACTIVITY_COUNT,
  UPDATE_OTHER_ACCOUNT,
  SET_PREV_LOGGED_IN_USERS,
  CLEAR_PREV_LOGGED_IN_USERS,
} from '../constants/constants';
import { PrevLoggedInUsers } from '../reducers/accountReducer';

export const fetchGlobalProperties = () => async (dispatch) => {
  try {
    const queryClient = getQueryClient();
    const props: DynamicProps = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

    // SDK already returns parsed numeric values
    const res = {
      hivePerMVests: props.hivePerMVests,
      base: props.base,
      quote: props.quote,
      fundRecentClaims: props.fundRecentClaims,
      fundRewardBalance: props.fundRewardBalance,
      hbdPrintRate: props.hbdPrintRate,
    };

    dispatch({
      type: SET_GLOBAL_PROPS,
      payload: { ...res },
    });
  } catch (error) {
    console.error('Failed to fetch global properties:', error);
    dispatch(failedAccount(error));
  }
};

export const updateCurrentAccount = (data) => {
  if (!data) {
    return {
      type: UPDATE_CURRENT_ACCOUNT,
      payload: data,
    };
  }

  const normalized = { ...data };
  if (!normalized.name && normalized.username) {
    normalized.name = normalized.username;
  }
  if (!normalized.username && normalized.name) {
    normalized.username = normalized.name;
  }

  return {
    type: UPDATE_CURRENT_ACCOUNT,
    payload: normalized,
  };
};

export const addOtherAccount = (data) => ({
  type: ADD_OTHER_ACCOUNT,
  payload: data,
});

export const updateOtherAccount = (accountObj) => ({
  type: UPDATE_OTHER_ACCOUNT,
  payload: accountObj,
});

export const failedAccount = (data) => ({
  type: FETCH_ACCOUNT_FAIL,
  payload: data,
});

export const updateUnreadActivityCount = (data) => ({
  type: UPDATE_UNREAD_ACTIVITY_COUNT,
  payload: data,
});

export const removeOtherAccount = (data) => ({
  type: REMOVE_OTHER_ACCOUNT,
  payload: data,
});

export const removeAllOtherAccount = () => ({
  type: REMOVE_ALL_OTHER_ACCOUNT,
});

export const setGlobalProps = (data) => ({
  type: SET_GLOBAL_PROPS,
  payload: data,
});

export const setPrevLoggedInUsers = (data: PrevLoggedInUsers[]) => ({
  payload: data,
  type: SET_PREV_LOGGED_IN_USERS,
});

export const clearPrevLoggedInUsers = () => ({
  type: CLEAR_PREV_LOGGED_IN_USERS,
});
