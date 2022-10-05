import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import unionBy from 'lodash/unionBy';
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
  const [paginatedData, setPaginatedData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageParam, setPageParam] = useState('');

  const _fetchNotifications = async () => {
    console.log('fetching page since:', pageParam);
    const response = await getNotifications({ filter, since: pageParam, limit: FETCH_LIMIT });
    console.log('new page fetched', response);
    return response || [];
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastId = lastPage && lastPage.length ? lastPage.lastItem.id : undefined;
    console.log('extracting next page parameter', lastId);
    return lastId;
  };

  const _onFetchSuccess = (data: any[]) => {
    const _data = isRefreshing ? data : unionBy(paginatedData, data, 'id');

    //extract next page param
    setPaginatedData(_data || []);
    setIsRefreshing(false);
  };

  //query initialization
  const notificationQuery = useQuery<any[]>(
    [QUERIES.NOTIFICATIONS.GET, filter, pageParam],
    _fetchNotifications,
    {
      initialData: [],
      keepPreviousData: true,
      onSuccess: _onFetchSuccess,
    },
  );

  const _refresh = async () => {
    setIsRefreshing(true);
    setPageParam('');
  };

  const _fetchNextPage = () => {
    const lastId = _getNextPageParam(paginatedData || []);
    setPageParam(lastId);
  };

  return {
    data: paginatedData.length ? paginatedData : notificationQuery.data,
    isRefreshing,
    isLoading: notificationQuery.isLoading || notificationQuery.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};

export const useNotificationReadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  //id is options, if no id is provided program marks all notifications as read;
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
      //TODO: find a way to optimise mutations by avoiding too many loops
      console.log('on mutate data', notificationId);

      //update query data
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
