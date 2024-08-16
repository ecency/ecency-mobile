import { fetchGlobalProps } from '../../providers/hive/dhive';
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

export const fetchGlobalProperties = () => (dispatch) =>
  fetchGlobalProps().then((res) =>
    dispatch({
      type: SET_GLOBAL_PROPS,
      payload: { ...res },
    }),
  );

export const updateCurrentAccount = (data) => ({
  type: UPDATE_CURRENT_ACCOUNT,
  payload: data,
});

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
