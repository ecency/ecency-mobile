import { getAccount } from '../../providers/steem/dsteem';
import {
  FETCH_ACCOUNT_FAIL,
  FETCHING_ACCOUNT,
  ADD_OTHER_ACCOUNT,
  UPDATE_CURRENT_ACCOUNT,
} from '../constants/constants';

export const fetchAccountFromSteem = (username, password) => (dispatch) => {
  dispatch({ type: FETCHING_ACCOUNT });

  return getAccount(username)
    .then(res => dispatch({
      type: UPDATE_CURRENT_ACCOUNT,
      payload: { ...res[0], password },
    }))
    .catch(err => dispatch({ type: FETCH_ACCOUNT_FAIL, payload: err }));
};

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
