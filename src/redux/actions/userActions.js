import { getAccount } from '../../providers/steem/Dsteem';
import {
    FETCH_USER,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAIL,
    LOGOUT,
} from '../constants/Constants';

export function fetchAccount(user) {
    return dispatch => {
        dispatch({ type: FETCH_USER });

        return getAccount(user)
            .then(res => {
                return dispatch({ type: FETCH_USER_SUCCESS, payload: res[0] });
            })
            .catch(err => {
                return dispatch({ type: FETCH_USER_FAIL, payload: err });
            });
    };
}

export function logout() {
    return {
        type: LOGOUT,
    };
}
