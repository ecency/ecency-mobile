/* eslint-disable no-unused-vars */
import { createStore, applyMiddleware, compose } from "redux";
import promise from "redux-promise";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { composeWithDevTools } from "redux-devtools-extension";
import reducers from "../reducers/index";

const middleware = [thunk, promise];
if (process.env.NODE_ENV === "development") {
    middleware.push(logger);
}

const store = createStore(
    reducers,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
