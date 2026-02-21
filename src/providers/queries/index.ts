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
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds — SDK overrides per-query where needed
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (was 6 days)
        refetchOnWindowFocus: false,
        refetchOnMount: false, // prevents refetch on every screen mount
      },
    },
  });

  // Initialize SDK configuration (async, runs in background)
  initSdkConfig(client).catch((error) => {
    console.error('Failed to initialize SDK config:', error);
  });

  const _shouldDehydrateQuery = (query: Query) => {
    const _isSuccess = query.state.status === 'success';

    // Don't persist queries with undefined in their query keys
    if (query.queryKey.some((key) => key === undefined)) {
      return false;
    }

    if (_isSuccess) {
      // Cherry pick which queries to dehydrate for persistence
      const queryKeyType = query.queryKey[0];

      // Handle SDK queries
      if (
        queryKeyType === 'core' ||
        queryKeyType === 'posts' ||
        queryKeyType === 'get-account-full' ||
        queryKeyType === 'notifications'
      ) {
        // SDK posts queries - selective persistence
        if (queryKeyType === 'posts') {
          const subType = query.queryKey[1];

          // Don't persist individual post entries
          if (subType === 'entry') {
            return false;
          }

          // For feed queries (account-posts, posts-ranked), only persist first page
          if (subType === 'account-posts' || subType === 'posts-ranked') {
            // These are infinite queries - only persist if it's the first page
            // Check if query has been fetched (has pages data)
            const queryData = query.state.data as any;
            if (queryData?.pages && queryData.pages.length > 1) {
              return false; // Don't persist if more than first page loaded
            }
            return true; // Persist first page only
          }

          return true; // Persist other post queries
        }

        if (queryKeyType === 'notifications' && query.queryKey[1] === 'announcements') {
          return false; // Don't persist announcements
        }

        return true; // Persist other SDK queries
      }

      // Handle mobile-specific legacy queries
      switch (queryKeyType) {
        case QUERIES.WAVES.GET:
          return query.queryKey[3] === 0; // only dehydrate first page of waves
        case QUERIES.NOTIFICATIONS.GET:
          return query.queryKey[2] === ''; // only dehydrate first page of notifications
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
export * from './statsQueries';
export * from './searchQueries';
