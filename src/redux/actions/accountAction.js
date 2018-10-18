import { getAccount } from '../../providers/steem/dsteem';
import {
  ADD_NEW_ACCOUNT,
  UPDATE_ACCOUNT_DATA,
  REMOVE_ACCOUNT_DATA,
  FETCH_ACCOUNT_FAIL,
  FETCHING_ACCOUNT,
} from '../constants/constants';

export const fetchAccountFromSteem = (username, password) => (dispatch) => {
  dispatch({ type: FETCHING_ACCOUNT });

  return getAccount(username)
    .then(res => dispatch({
      type: ADD_NEW_ACCOUNT,
      payload: { ...res[0], password },
    }))
    .catch(err => dispatch({ type: FETCH_ACCOUNT_FAIL, payload: err }));
};

export const addPassiveAccount = data => ({
  type: ADD_NEW_ACCOUNT,
  payload: { isActive: false, ...data },
});

export const addNewAccount = data => ({
  type: ADD_NEW_ACCOUNT,
  payload: data,
});

export const updateAccountData = data => ({
  type: UPDATE_ACCOUNT_DATA,
  payload: data,
});

export const removeAccountData = data => ({
  type: REMOVE_ACCOUNT_DATA,
  payload: data,
});

export const failedAccount = data => ({
  type: FETCH_ACCOUNT_FAIL,
  payload: data,
});
