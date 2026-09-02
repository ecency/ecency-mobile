import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';
import { createMigrate, createTransform, persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import reducers from '../reducers';
import MigrationHelpers from '../../utils/migrationHelpers';

// Cap the unbounded optimistic-vote and point-activity caches before they are serialized
// to AsyncStorage. The full collections stay in memory for the session; only the persisted
// (most-recent) slice is bounded, which reduces the AsyncStorage (SQLite) write volume and
// JSON serialization cost on the JS thread. Insertion order keeps the newest entries.
// NOTE: this is write-volume hygiene, NOT the Background-ANR fix — that ANR is react-native-
// firebase's own SharedPreferences message store on the main thread (fixed via patch-package).
const CACHE_PERSIST_LIMIT = 200;
const capObject = (obj: Record<string, any> = {}, limit = CACHE_PERSIST_LIMIT) => {
  const safe = obj || {};
  const entries = Object.entries(safe);
  return entries.length <= limit ? safe : Object.fromEntries(entries.slice(-limit));
};

const transformCacheVoteMap = createTransform(
  (inboundState: any) => ({
    ...inboundState,
    votesCollection: capObject(inboundState.votesCollection),
    subscribedCommunities: Array.from(inboundState.subscribedCommunities),
    pointActivities: Array.from(inboundState.pointActivities).slice(-CACHE_PERSIST_LIMIT),
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
  version: 22, // v22: Default the followed-hashtag (tags) notification ON
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
