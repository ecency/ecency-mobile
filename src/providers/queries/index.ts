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
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
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
