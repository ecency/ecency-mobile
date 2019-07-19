import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import applicationReducer from './applicationReducer';
import nav from './nav';
import ui from './uiReducer';
import postsReducer from './postsReducer';

export default combineReducers({
  account: accountReducer,
  application: applicationReducer,
  posts: postsReducer,
  nav,
  ui,
});
