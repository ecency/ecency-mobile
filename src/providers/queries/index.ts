import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';

export const initQueryClient = () => {
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  const client = new QueryClient({
    //Query client configurations go here...
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 24 * 6 , // 7 days cache timer
      },
    },
  });

  return {
    client,
    persistOptions: { persister: asyncStoragePersister },
  } as PersistQueryClientProviderProps;
};

export * from './notificationQueries';
export * from './draftQueries';
export * from './editorQueries';
export * from './pointQueries';
export * from './postQueries';
export * from './walletQueries';
export * from './leaderboardQueries';
export * from './wavesQueries';