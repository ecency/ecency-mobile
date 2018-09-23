import { combineReducers } from "redux";
import userReducer from "./userReducer";
import accountReducer from "./accountReducer";

export default combineReducers({
    account: accountReducer,
});
