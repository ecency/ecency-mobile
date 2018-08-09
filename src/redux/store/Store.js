/* eslint-disable no-unused-vars */
import { createStore, applyMiddleware, compose } from 'redux';
import promise from 'redux-promise';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from '../reducers/index';

const store = createStore(
    reducers,
    composeWithDevTools(applyMiddleware(thunk, promise, logger))
);

export default store;
