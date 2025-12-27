import { createSelector } from 'reselect';

/**
 * Memoized Redux Selectors
 *
 * These selectors use reselect to memoize Redux state selections, which prevents:
 * 1. Creating new functions on every render (performance improvement)
 * 2. Unnecessary component re-renders (React.memo optimization works better)
 *
 * HOW TO USE:
 * Instead of:
 *   const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
 *
 * Use:
 *   import { selectIsDarkTheme } from '../redux/selectors';
 *   const isDarkTheme = useSelector(selectIsDarkTheme);
 *
 * This creates a stable reference that only changes when the actual value changes,
 * not on every render.
 */

// Base selectors
const getApplicationState = (state: any) => state.application;
const getAccountState = (state: any) => state.account;
const getCacheState = (state: any) => state.cache;
const getPostsState = (state: any) => state.posts;
// const getUIState = (state: any) => state.ui;

// ===== APPLICATION SELECTORS =====

// Authentication & Login
export const selectIsLoggedIn = createSelector(
  [getApplicationState],
  (application) => application.isLoggedIn,
);

export const selectIsLoginDone = createSelector(
  [getApplicationState],
  (application) => application.isLoginDone,
);

export const selectPin = createSelector([getApplicationState], (application) => application.pin);

export const selectEncUnlockPin = createSelector(
  [getApplicationState],
  (application) => application.encUnlockPin,
);

export const selectIsPinCodeOpen = createSelector(
  [getApplicationState],
  (application) => application.isPinCodeOpen,
);

export const selectIsBiometricEnabled = createSelector(
  [getApplicationState],
  (application) => application.isBiometricEnabled,
);

// UI/Theme Settings
export const selectIsDarkTheme = createSelector(
  [getApplicationState],
  (application) => application.isDarkTheme,
);

export const selectColorTheme = createSelector(
  [getApplicationState],
  (application) => application.colorTheme,
);

export const selectHidePostsThumbnails = createSelector(
  [getApplicationState],
  (application) => application.hidePostsThumbnails,
);

// Network & Connectivity
export const selectIsConnected = createSelector(
  [getApplicationState],
  (application) => application.isConnected,
);

// Localization
export const selectLanguage = createSelector(
  [getApplicationState],
  (application) => application.language,
);

export const selectCurrency = createSelector(
  [getApplicationState],
  (application) => application.currency,
);

export const selectCurrencyRate = createSelector(
  [selectCurrency],
  (currency) => currency?.currencyRate || 1,
);

export const selectCurrencySymbol = createSelector(
  [selectCurrency],
  (currency) => currency?.currencySymbol || '$',
);

// Content Settings
export const selectNsfw = createSelector([getApplicationState], (application) => application.nsfw);

export const selectPostUpvotePercent = createSelector(
  [getApplicationState],
  (application) => application.postUpvotePercent,
);

export const selectCommentUpvotePercent = createSelector(
  [getApplicationState],
  (application) => application.commentUpvotePercent,
);

export const selectWaveUpvotePercent = createSelector(
  [getApplicationState],
  (application) => application.waveUpvotePercent,
);

// Notification Settings
export const selectNotificationDetails = createSelector(
  [getApplicationState],
  (application) => application.notificationDetails,
);

export const selectIsNotificationOpen = createSelector(
  [getApplicationState],
  (application) => application.isNotificationOpen,
);

// App State
export const selectApi = createSelector([getApplicationState], (application) => application.api);

export const selectIsTermsAccepted = createSelector(
  [getApplicationState],
  (application) => application.isTermsAccepted,
);

export const selectLastAppVersion = createSelector(
  [getApplicationState],
  (application) => application.lastAppVersion,
);

export const selectSettingsMigratedV2 = createSelector(
  [getApplicationState],
  (application) => application.settingsMigratedV2,
);

// ===== ACCOUNT SELECTORS =====

export const selectCurrentAccount = createSelector(
  [getAccountState],
  (account) => account.currentAccount,
);

export const selectCurrentAccountUsername = createSelector(
  [selectCurrentAccount],
  (currentAccount) => currentAccount?.username || null,
);

export const selectCurrentAccountMutes = createSelector(
  [selectCurrentAccount],
  (currentAccount) => currentAccount?.mutes || [],
);

export const selectCurrentAccountName = createSelector(
  [selectCurrentAccount],
  (currentAccount) => currentAccount?.name || null,
);

export const selectGlobalProps = createSelector(
  [getAccountState],
  (account) => account.globalProps,
);

export const selectPrevLoggedInUsers = createSelector(
  [getAccountState],
  (account) => account.prevLoggedInUsers || [],
);

// Cache selectors
export const selectVotesCollection = createSelector(
  [getCacheState],
  (cache) => cache.votesCollection,
);

export const selectCacheLastUpdate = createSelector([getCacheState], (cache) => cache.lastUpdate);

export const selectCommentsCollection = createSelector(
  [getCacheState],
  (cache) => cache.commentsCollection,
);

// Posts selectors
export const selectFeedPosts = createSelector([getPostsState], (posts) => posts.feedPosts);

export const selectOtherPosts = createSelector([getPostsState], (posts) => posts.otherPosts);

export const selectFeedScrollPosition = createSelector(
  [getPostsState],
  (posts) => posts.feedScrollPosition,
);

export const selectOtherScrollPosition = createSelector(
  [getPostsState],
  (posts) => posts.otherScrollPosition,
);

// Parameterized selectors for dynamic data
export const makeSelectPostsForScreen = () =>
  createSelector(
    [getPostsState, (_state: any, isFeedScreen: boolean) => isFeedScreen],
    (posts, isFeedScreen) => (isFeedScreen ? posts.feedPosts : posts.otherPosts),
  );

export const makeSelectScrollPositionForScreen = () =>
  createSelector(
    [getPostsState, (_state: any, isFeedScreen: boolean) => isFeedScreen],
    (posts, isFeedScreen) => (isFeedScreen ? posts.feedScrollPosition : posts.otherScrollPosition),
  );

// Vote cache selector for specific post
export const makeSelectVoteForPost = () =>
  createSelector(
    [selectVotesCollection, (_state: any, postPath: string) => postPath],
    (votesCollection, postPath) => votesCollection[postPath],
  );
