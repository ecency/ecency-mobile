import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import nav from './nav';

export default combineReducers({
  account: accountReducer,
  nav,
});
