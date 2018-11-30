import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import applicationReducer from './applicationReducer';
import nav from './nav';
import ui from './uiReducer';

export default combineReducers({
  account: accountReducer,
  application: applicationReducer,
  nav,
  ui,
});
