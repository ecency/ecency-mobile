import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import applicationReducer from './applicationReducer';
import nav from './nav';

export default combineReducers({
  account: accountReducer,
  application: applicationReducer,
  nav,
});
