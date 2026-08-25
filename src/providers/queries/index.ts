import { Query, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import { getQueryClient as getQueryClientFromSDK } from '@ecency/sdk';
import VersionNumber from 'react-native-version-number';
import { initSdkConfig } from './sdk-config';

export const initQueryClient = () => {
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    // Batch cache writes (default is 1000ms). A longer window reduces how often the large
    // dehydrated-cache blob is rewritten to AsyncStorage (SQLite) — write-volume + JSON
    // serialization hygiene. (The Background ANR is react-native-firebase's own
    // SharedPreferences store, not AsyncStorage; fixed separately via patch-package.)
    throttleTime: 2000,
  });

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds — SDK overrides per-query where needed
        gcTime: 30 * 60 * 1000, // 30 minutes — longer retention for mobile navigation patterns
        refetchOnWindowFocus: false,
        refetchOnMount: true, // refetch stale data on screen mount (respects staleTime)
      },
    },
  });

  // Initialize SDK configuration (async, runs in background)
  initSdkConfig(client).catch((error) => {
    console.error('Failed to initialize SDK config:', error);
  });

  // Selective persistence allowlist. Query keys are unified in @ecency/sdk
  // (QueryKeys.*), so we match on the SDK namespace (queryKey[0]) and subtype
  // (queryKey[1]). Infinite lists carry full post bodies and grow with each page
  // scrolled, so they are persisted only while a single page is loaded to keep
  // the on-disk cache bounded.
  const _shouldDehydrateQuery = (query: Query) => {
    if (query.state.status !== 'success') {
      // Only log errors (not pending states) for debugging
      if (query.state.status === 'error') {
        console.log('query error for dehydration', query.queryKey, query.state.error);
      }
      return false;
    }

    // Don't persist queries with undefined in their query keys
    if (query.queryKey.some((key) => key === undefined)) {
      return false;
    }

    const namespace = query.queryKey[0];
    const subType = query.queryKey[1];

    const data = query.state.data as any;
    const isSinglePage = !(data?.pages && data.pages.length > 1);

    switch (namespace) {
      // SDK global config + the user's own account-full data (small, offline-useful)
      case 'core':
      case 'get-account-full':
        return true;

      // QueryKeys.posts.*
      case 'posts':
        if (subType === 'entry') {
          return false; // individual posts refetch on view
        }
        // Feeds + drafts/schedules are infinite lists — persist first page only so
        // persisted storage can't grow unbounded with full post bodies on scroll.
        if (
          subType === 'account-posts' ||
          subType === 'posts-ranked' ||
          subType === 'waves' ||
          subType === 'drafts' ||
          subType === 'schedules'
        ) {
          return isSinglePage;
        }
        return true; // other post queries (discussions, comment history, …)

      // QueryKeys.accounts.* — bookmarks/favorites moved under this namespace on the
      // SDK key unification, so the old 'bookmarks'/'favourites' cases were dead and
      // they were silently never persisted. Persist first page only.
      case 'accounts':
        if (subType === 'bookmarks' || subType === 'favorites') {
          return isSinglePage;
        }
        return false; // other account lists (followers, following, …) not persisted

      // QueryKeys.notifications.*
      case 'notifications':
        if (subType === 'announcements') {
          return false;
        }
        return isSinglePage; // first page only (was: all pages)

      case 'points':
        return true;

      default:
        return false;
    }
  };

  return {
    client,
    persistOptions: {
      persister: asyncStoragePersister,
      // Bust the persisted cache across app updates so query data whose shape
      // changed with an SDK/schema update can't be restored stale.
      buster: VersionNumber.appVersion,
      dehydrateOptions: {
        shouldDehydrateQuery: _shouldDehydrateQuery,
      },
    },
  } as PersistQueryClientProviderProps;
};

/**
 * Get the query client instance from SDK
 * This is a convenience re-export of the SDK's getQueryClient
 */
export const getQueryClient = getQueryClientFromSDK;

export * from './notificationQueries';
export * from './draftQueries';
export * from './bookmarkQueries';
export * from './editorQueries';
export * from './pointQueries';
export * from './postQueries';
export * from './walletQueries';
export * from './leaderboardQueries';
export * from './settingsQueries';
export * from './announcementsQueries';
export * from './proposalQueries';
export * from './proQueries';
export * from './statsQueries';
export * from './searchQueries';
export * from './communityQueries';
export * from './newsletterQueries';
