import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import Reactotron from '../../../reactotron-config';

import reducer from '../reducers';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const transformCacheVoteMap = createTransform(
  (inboundState:any) => ({ 
    ...inboundState, 
    votes : Array.from(inboundState.votes),
    comments : Array.from(inboundState.comments),
    drafts : Array.from(inboundState.drafts),
  }),
  (outboundState) => ({ 
    ...outboundState, 
    votes:new Map(outboundState.votes),
    comments:new Map(outboundState.comments),
    drafts: new Map(outboundState.drafts)
  }),
  {whitelist:['cache']}
);

const transformWalkthroughMap = createTransform(
  (inboundState:any) => ({ ...inboundState, walkthroughMap : Array.from(inboundState.walkthroughMap)}),
  (outboundState) => ({ ...outboundState, walkthroughMap:new Map(outboundState.walkthroughMap)}),
  {whitelist:['walkthrough']}
);



// Middleware: Redux Persist Config
const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // Blacklist (Don't Save Specific Reducers)
  blacklist: ['nav', 'application', 'communities', 'user'],
  timeout: 0,
  transforms:[
    transformCacheVoteMap,
    transformWalkthroughMap
  ]
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, reducer as any);

const middleware = [thunk];

const enhancers = __DEV__
  ? compose(applyMiddleware(...middleware), Reactotron.createEnhancer())
  : applyMiddleware(...middleware);

const store = createStore(persistedReducer, enhancers);

const persistor = persistStore(store);

export { store, persistor };


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
