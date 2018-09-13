import { getAccount } from "../../providers/steem/dsteem";
import {
    ADD_NEW_ACCOUNT,
    UPDATE_ACCOUNT_DATA,
    REMOVE_ACCOUNT_DATA,
    FETCH_ACCOUNT_FAIL,
    FETCHING_ACCOUNT,
} from "../constants/constants";

export function fetchAccountFromSteem(user) {
    return dispatch => {
        dispatch({ type: FETCHING_ACCOUNT });

        return getAccount(user)
            .then(res => {
                return dispatch({ type: ADD_NEW_ACCOUNT, payload: res[0] });
            })
            .catch(err => {
                return dispatch({ type: FETCH_ACCOUNT_FAIL, payload: err });
            });
    };
}

export function addNewAccount(data) {
    return {
        type: ADD_NEW_ACCOUNT,
        payload: data,
    };
}

export function updateAccountData(data) {
    return {
        type: UPDATE_ACCOUNT_DATA,
        payload: data,
    };
}

export function removeAccountData(data) {
    return {
        type: REMOVE_ACCOUNT_DATA,
        payload: data,
    };
}
