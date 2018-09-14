import {
    ADD_NEW_ACCOUNT,
    UPDATE_ACCOUNT_DATA,
    REMOVE_ACCOUNT_DATA,
    FETCH_ACCOUNT_FAIL,
    FETCHING_ACCOUNT,
} from "../constants/constants";

const initialState = {
    isFetching: null,
    data: [],
    hasError: false,
    errorMessage: null,
};

export default function(state = initialState, action) {
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
                errorMessage: action.err,
            };
        case ADD_NEW_ACCOUNT:
            return {
                ...state,
                isFetching: false,
                data: [...state.data, action.payload],
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

        default:
            return state;
    }
}
