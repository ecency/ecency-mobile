import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import bugsnapInstance from '../../config/bugsnag';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateUnreadActivityCount } from '../../redux/actions/accountAction';
import { toastNotification } from '../../redux/actions/uiAction';
import { getNotifications, markNotifications } from '../ecency/ecency';
import { NotificationFilters } from '../ecency/ecency.types';
import { markHiveNotifications } from '../hive/dhive';
import QUERIES from './queryKeys';

const FETCH_LIMIT = 20;

export const useNotificationsQuery = (filter: NotificationFilters) => {

  const [reducedData, setReducedData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const _fetchNotifications = async (pageParam: string) => {
    console.log('fetching page since:', pageParam);
    const response = await getNotifications({ filter, since: pageParam, limit: FETCH_LIMIT });
    console.log('new page fetched', response);
    return response || [];
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastId = lastPage && lastPage.length === FETCH_LIMIT ? lastPage.lastItem.id : undefined;
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


export const useNotificationReadMutation = (filter: NotificationFilters) => {

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const pinCode = useAppSelector(state => state.application.pin);


  //id is options, if no id is provided program marks all notifications as read;
  const _mutationFn = async (id?: string) => {
    try {
      const response = await markNotifications(id);
      console.log('Ecency notifications marked as Read', response);
      if (!id) {
        await markHiveNotifications(currentAccount, pinCode)
        console.log('Hive notifications marked as Read');
      }

      return response.unread || 0;

    } catch (err) {
      bugsnapInstance.notify(err);
    }
  }


  const _options: UseMutationOptions<number, unknown, string | undefined, void> = {
    onMutate: (notificationId) => {
      console.log("on mutate data", notificationId);

      //update query data
      const queriesData: [QueryKey, InfiniteData<any[]> | undefined][] = queryClient.getQueriesData([QUERIES.NOTIFICATIONS.GET])
      console.log("query data", queriesData);


      queriesData.forEach(dataSet => {
        const queryKey = dataSet[0];
        const _data = dataSet[1];
        if (_data && _data.pages) {
          _data.pages = _data.pages.map((page) => page.map(
            (item) => ({ ...item, read: !notificationId || notificationId === item.id ? 1 : item.read })
          ))
          console.log("mutated query data", queryKey, _data.pages)
          queryClient.setQueryData(queryKey, _data);
        }
      })


    },
    onSuccess: async (unreadCount, notificationId) => {
      console.log("on success data", unreadCount);

      dispatch(updateUnreadActivityCount(unreadCount));
      if (!notificationId) {
        queryClient.invalidateQueries([QUERIES.NOTIFICATIONS.GET]);
      }

    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    }
  }

  return useMutation(_mutationFn, _options)
}
