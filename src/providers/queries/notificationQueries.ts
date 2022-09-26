import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getNotifications } from '../ecency/ecency';
import { NotificationFilters } from '../ecency/ecency.types';
import QUERIES from './queryKeys';

export const useNotificationsQuery = (filter: NotificationFilters) => {
  const _fetchLimit = 20;

  const [reducedData, setReducedData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const _fetchNotifications = async (pageParam: string) => {
    console.log('fetching page since:', pageParam);
    const response = await getNotifications({ filter, since: pageParam, limit: _fetchLimit });
    console.log('new page fetched', response);
    return response || [];
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastId = lastPage && lastPage.length === _fetchLimit ? lastPage.lastItem.id : undefined;
    console.log('extracting next page parameter', lastId);
    return lastId;
  };

  //query initialization
  const notificationQuery = useInfiniteQuery<any[]>(
    [QUERIES.NOTIFICATIONS.GET, filter],
    ({ pageParam }) => _fetchNotifications(pageParam),
    {
      initialData: {
        pageParams: [undefined],
        pages: [],
      },
      getNextPageParam: _getNextPageParam,
    },
  );

  //workaround for handling query refresh
  useEffect(() => {
    if (!isRefreshing) {
      const _data = notificationQuery.data?.pages.flatMap((page) => page);
      console.log('flat map', _data);
      setReducedData(_data || []);
    }
  }, [notificationQuery.data, isRefreshing]);

  const _refresh = async () => {
    setIsRefreshing(true);
    notificationQuery.remove();
    await notificationQuery.refetch();
    setIsRefreshing(false);
  };

  return {
    ...notificationQuery,
    reducedData,
    refresh: _refresh,
  };
};
