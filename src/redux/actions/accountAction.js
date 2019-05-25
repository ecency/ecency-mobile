import { fetchGlobalProps } from '../../providers/steem/dsteem';
import {
  ADD_OTHER_ACCOUNT,
  FETCH_ACCOUNT_FAIL,
  REMOVE_OTHER_ACCOUNT,
  SET_GLOBAL_PROPS,
  SET_PIN_CODE,
  UPDATE_CURRENT_ACCOUNT,
  UPDATE_UNREAD_ACTIVITY_COUNT,
} from '../constants/constants';

export const fetchGlobalProperties = () => dispatch =>
  fetchGlobalProps().then(res =>
    dispatch({
      type: SET_GLOBAL_PROPS,
      payload: { ...res },
    }),
  );

export const updateCurrentAccount = data => ({
  type: UPDATE_CURRENT_ACCOUNT,
  payload: data,
});

export const addOtherAccount = data => ({
  type: ADD_OTHER_ACCOUNT,
  payload: data,
});

export const failedAccount = data => ({
  type: FETCH_ACCOUNT_FAIL,
  payload: data,
});

export const updateUnreadActivityCount = data => ({
  type: UPDATE_UNREAD_ACTIVITY_COUNT,
  payload: data,
});

export const removeOtherAccount = data => ({
  type: REMOVE_OTHER_ACCOUNT,
  payload: data,
});

export const setPinCode = data => ({
  type: SET_PIN_CODE,
  payload: data,
});

export const setGlobalProps = data => ({
  type: SET_GLOBAL_PROPS,
  payload: data,
});
