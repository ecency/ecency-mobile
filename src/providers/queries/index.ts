import { Query, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import QUERIES from './queryKeys';

export const initQueryClient = () => {
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  const client = new QueryClient({
    // Query client configurations go here...
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 24 * 6, // 7 days cache timer
      },
    },
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

export * from './notificationQueries';
export * from './draftQueries';
export * from './editorQueries';
export * from './pointQueries';
export * from './postQueries';
export * from './walletQueries';
export * from './leaderboardQueries';
export * from './settingsQueries';
export * from './announcementsQueries';
