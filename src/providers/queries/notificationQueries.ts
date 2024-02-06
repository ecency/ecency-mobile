import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import bugsnapInstance from '../../config/bugsnag';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateUnreadActivityCount } from '../../redux/actions/accountAction';
import { toastNotification } from '../../redux/actions/uiAction';
import { getAnnouncements, getNotifications, markNotifications } from '../ecency/ecency';
import { NotificationFilters } from '../ecency/ecency.types';
import { markHiveNotifications } from '../hive/dhive';
import QUERIES from './queryKeys';

const FETCH_LIMIT = 20;

export const useNotificationsQuery = (filter: NotificationFilters) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageParams, setPageParams] = useState(['']);

  const _fetchNotifications = async (pageParam: string) => {
    console.log('fetching page since:', pageParam);
    const response = await getNotifications({ filter, since: pageParam, limit: FETCH_LIMIT });
    // console.log('new page fetched', response);
    return response || [];
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastId = lastPage && lastPage.length ? lastPage.lastItem.id : undefined;
    console.log('extracting next page parameter', lastId);
    return lastId;
  };

  // query initialization
  const notificationQueries = useQueries({
    queries: pageParams.map((pageParam) => ({
      queryKey: [QUERIES.NOTIFICATIONS.GET, filter, pageParam],
      queryFn: () => _fetchNotifications(pageParam),
      initialData: [],
    })),
  });

  const _refresh = async () => {
    setIsRefreshing(true);
    setPageParams(['']);
    await notificationQueries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    const lastPage = notificationQueries.lastItem;

    if (!lastPage || lastPage.isFetching) {
      return;
    }

    const lastId = _getNextPageParam(lastPage.data);
    if (!pageParams.includes(lastId)) {
      pageParams.push(lastId);
      setPageParams([...pageParams]);
    }
  };

  const _dataArrs = notificationQueries.map((query) => query.data);

  return {
    data: unionBy(..._dataArrs, 'id'),
    isRefreshing,
    isLoading: notificationQueries.lastItem.isLoading || notificationQueries.lastItem.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};



export const useAnnouncementsQuery = () => {
  return useQuery([QUERIES.NOTIFICATIONS.GET_ANNOUNCEMENTS], getAnnouncements);
}


export const useNotificationReadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  // id is options, if no id is provided program marks all notifications as read;
  const _mutationFn = async (id?: string) => {
    try {
      const response = await markNotifications(id);
      console.log('Ecency notifications marked as Read', response);
      if (!id) {
        await markHiveNotifications(currentAccount, pinCode);
        console.log('Hive notifications marked as Read');
      }

      return response.unread || 0;
    } catch (err) {
      bugsnapInstance.notify(err);
    }
  };

  const _options: UseMutationOptions<number, unknown, string | undefined, void> = {
    onMutate: async (notificationId) => {
      // TODO: find a way to optimise mutations by avoiding too many loops
      console.log('on mutate data', notificationId);

      // update query data
      const queriesData: [QueryKey, any[] | undefined][] = queryClient.getQueriesData([
        QUERIES.NOTIFICATIONS.GET,
      ]);
      console.log('query data', queriesData);

      queriesData.forEach(([queryKey, data]) => {
        if (data) {
          console.log('mutating data', queryKey);
          const _mutatedData = data.map((item) => ({
            ...item,
            read: !notificationId || notificationId === item.id ? 1 : item.read,
          }));
          queryClient.setQueryData(queryKey, _mutatedData);
        }
      });
    },

    onSuccess: async (unreadCount, notificationId) => {
      console.log('on success data', unreadCount);

      dispatch(updateUnreadActivityCount(unreadCount));
      if (!notificationId) {
        queryClient.invalidateQueries([QUERIES.NOTIFICATIONS.GET]);
      }
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  };

  return useMutation(_mutationFn, _options);
};
