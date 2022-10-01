import { InfiniteData, useInfiniteQuery, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
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


export const useNotificationReadMutation = (filter: NotificationFilters) => {

  const intl = useIntl();
  const dispatch = useAppDispatch();  
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const pinCode = useAppSelector(state => state.application.pin);


  const _mutationFn = async () => {
    try {
      await markNotifications();
      console.log('Ecency notifications marked as Read');
      await markHiveNotifications(currentAccount, pinCode)
      console.log('Hive notifications marked as Read');

    } catch (err) {
      bugsnapInstance.notify(err);
    }
  }


  const _options:UseMutationOptions<void, unknown, void, void> = {
      onMutate: () => {
        
        //TODO: reset this routine
        //update query data
        const _data:InfiniteData<any[]>|undefined = queryClient.getQueryData([QUERIES.DRAFTS.GET, filter])
        if(_data && _data.pages){
          _data.pages = _data.pages.map((page) => page.map((item) => ({ ...item, read: 1 })))
          queryClient.setQueryData([QUERIES.DRAFTS.GET, filter], _data);
        }
      },
      onSuccess: async () => {
        dispatch(updateUnreadActivityCount(0));
        queryClient.invalidateQueries([QUERIES.NOTIFICATIONS.GET]);
      },
      onError:  () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      }
  }

  return useMutation(_mutationFn, _options)
}
