import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import applicationReducer from './applicationReducer';
import ui from './uiReducer';
import postsReducer from './postsReducer';
import communities from './communitiesReducer';
import user from './userReducer';
import customTabsReducer from './customTabsReducer';
import editorReducer from './editorReducer';
import cacheReducer from './cacheReducer';
import walkthroughReducer from './walkthroughReducer';
import walletReducer from './walletReducer';

export default combineReducers({
  account: accountReducer,
  application: applicationReducer,
  posts: postsReducer,
  customTabs: customTabsReducer,
  editor: editorReducer,
  ui,
  communities,
  user,
  cache: cacheReducer,
  walkthrough: walkthroughReducer,
  wallet: walletReducer,
});
