import { getAccount } from '../../providers/steem/dsteem';
import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAIL,
  LOGOUT,
  IS_LOGGED_IN,
} from '../constants/constants';

export function isLoggedIn(payload) {
  return {
    payload,
    type: IS_LOGGED_IN,
  };
}

export function fetchAccount(user) {
  return (dispatch) => {
    dispatch({ type: FETCH_USER });

    return getAccount(user)
      .then(res => dispatch({ type: FETCH_USER_SUCCESS, payload: res[0] }))
      .catch(err => dispatch({ type: FETCH_USER_FAIL, payload: err }));
  };
}

export function logout() {
  return {
    type: LOGOUT,
  };
}
