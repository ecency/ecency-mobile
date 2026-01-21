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

    if (_isSuccess) {
      // Cherry pick whihc queries to dehydrate for persistance
      switch (query.queryKey[0]) {
        case QUERIES.WAVES.GET:
          return query.queryKey[3] === 0; // only dehydrate first page of waves
        case QUERIES.NOTIFICATIONS.GET:
          return query.queryKey[2] === ''; // only dehydrate first page of notifications
        case QUERIES.FEED.GET:
          return query.queryKey[3] === '' && query.queryKey[4]; // only hydrate first page if cacheFlag is enabled
        default:
          return true;
      }
    }

    console.log('status error for dehydration', query.queryKey);
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
