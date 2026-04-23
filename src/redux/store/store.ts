import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';
import { createMigrate, createTransform, persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import reducers from '../reducers';
import MigrationHelpers from '../../utils/migrationHelpers';

const transformCacheVoteMap = createTransform(
  (inboundState: any) => ({
    ...inboundState,
    subscribedCommunities: Array.from(inboundState.subscribedCommunities),
    pointActivities: Array.from(inboundState.pointActivities),
  }),
  (outboundState) => ({
    ...outboundState,
    subscribedCommunities: new Map(outboundState.subscribedCommunities),
    pointActivities: new Map(outboundState.pointActivities),
  }),
  { whitelist: ['cache'] },
);

const transformWalkthroughMap = createTransform(
  (inboundState: any) => ({
    ...inboundState,
    walkthroughMap: Array.from(inboundState.walkthroughMap),
  }),
  (outboundState) => ({ ...outboundState, walkthroughMap: new Map(outboundState.walkthroughMap) }),
  { whitelist: ['walkthrough'] },
);

// // Middleware: Redux Persist Config
const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  version: 15, // New version 15: Added waves tab to profile/ownProfile custom tabs
  // // Blacklist (Don't Save Specific Reducers)
  blacklist: ['communities', 'user', 'ui'],
  transforms: [transformCacheVoteMap, transformWalkthroughMap],
  migrate: createMigrate(MigrationHelpers.reduxMigrations, { debug: false }),
  throttle: 1000, // Limit AsyncStorage writes to once per second
};

// // Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, reducers);

const middleware = [thunk];

let enhancers;
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reactotron = require('../../../reactotron-config').default;
  enhancers = compose(applyMiddleware(...middleware), Reactotron.createEnhancer());
} else {
  enhancers = applyMiddleware(...middleware);
}

export const store = createStore(persistedReducer, enhancers);

export const persistor = persistStore(store);

// export { store, persistor };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
