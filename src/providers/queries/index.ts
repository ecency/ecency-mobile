import { Query, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import { getQueryClient as getQueryClientFromSDK } from '@ecency/sdk';
import QUERIES from './queryKeys';
import { initSdkConfig } from './sdk-config';

export const initQueryClient = () => {
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  const client = new QueryClient({
    // Query client configurations go here...
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24 * 6, // 7 days cache timer
      },
    },
  });

  // Initialize SDK configuration (async, runs in background)
  initSdkConfig(client).catch((error) => {
    console.error('Failed to initialize SDK config:', error);
  });

  const _shouldDehdrateQuery = (query: Query) => {
    const _isSuccess = query.state.status === 'success';

    // Don't persist queries with undefined in their query keys
    if (query.queryKey.some((key) => key === undefined)) {
      return false;
    }

    if (_isSuccess) {
      // Cherry pick which queries to dehydrate for persistence
      const queryKeyType = query.queryKey[0];

      // Skip SDK queries that shouldn't be persisted
      if (
        queryKeyType === 'core' ||
        queryKeyType === 'posts' ||
        queryKeyType === 'get-account-full' ||
        queryKeyType === 'notifications'
      ) {
        // SDK queries - only persist specific ones
        if (queryKeyType === 'posts' && query.queryKey[1] === 'entry') {
          return false; // Don't persist individual post entries from SDK
        }
        if (queryKeyType === 'notifications' && query.queryKey[1] === 'announcements') {
          return false; // Don't persist announcements
        }
        return true; // Persist other SDK queries
      }

      // Handle mobile-specific queries
      switch (queryKeyType) {
        case QUERIES.WAVES.GET:
          return query.queryKey[3] === 0; // only dehydrate first page of waves
        case QUERIES.NOTIFICATIONS.GET:
          return query.queryKey[2] === ''; // only dehydrate first page of notifications
        case QUERIES.FEED.GET:
          return query.queryKey[3] === '' && query.queryKey[4]; // only hydrate first page if cacheFlag is enabled
        case 'drafts':
        case 'schedules':
          return query.queryKey[2] === 0; // First page only
        default:
          return true;
      }
    }

    // Only log errors (not pending states) for debugging
    if (query.state.status === 'error') {
      console.log('query error for dehydration', query.queryKey, query.state.error);
    }

    return false;
  };

  return {
    client,
    persistOptions: {
      persister: asyncStoragePersister,
      dehydrateOptions: {
        shouldDehydrateQuery: _shouldDehdrateQuery,
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
export * from './statsQueries';
