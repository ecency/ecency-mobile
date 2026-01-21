import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import * as Sentry from '@sentry/react-native';
import { useMarkNotificationsRead } from '@ecency/sdk';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateUnreadActivityCount } from '../../redux/actions/accountAction';
import { toastNotification } from '../../redux/actions/uiAction';
import { getNotifications } from '../ecency/ecency';
import { NotificationFilters } from '../ecency/ecency.types';
import { markHiveNotifications } from '../hive/dhive';
import QUERIES from './queryKeys';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode } from '../hive/dhive';

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
    const lastId = !!lastPage?.length && lastPage[lastPage.length - 1].id;
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

  const _lastPage = notificationQueries[notificationQueries.length - 1];

  const _refresh = async () => {
    setIsRefreshing(true);
    setPageParams(['']);
    await notificationQueries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    if (!_lastPage || _lastPage.isFetching) {
      return;
    }

    const lastId = _getNextPageParam(_lastPage.data);
    if (lastId && !pageParams.includes(lastId)) {
      pageParams.push(lastId);
      setPageParams([...pageParams]);
    }
  };

  const _dataArrs = notificationQueries.map((query) => query.data);

  return {
    data: unionBy(..._dataArrs, 'id'),
    isRefreshing,
    isLoading: _lastPage.isLoading || _lastPage.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};

/**
 * Hook to mark notifications as read
 * Uses SDK's useMarkNotificationsRead with mobile-specific Hive notification marking
 */
export const useNotificationReadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  // Get auth credentials
  const digitPinCode = getDigitPinCode(pinHash);
  const username = currentAccount?.username;
  const accessToken = currentAccount?.local?.accessToken
    ? decryptKey(currentAccount.local.accessToken, digitPinCode)
    : undefined;

  // Use SDK hook with optimistic updates
  const sdkMutation = useMarkNotificationsRead(
    username,
    accessToken,
    async (unreadCount) => {
      // Mobile-specific: Update Redux unread count
      if (unreadCount !== undefined) {
        dispatch(updateUnreadActivityCount(unreadCount));
      }
    },
    (error) => {
      // Mobile-specific: Show error toast
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      Sentry.captureException(error);
    },
  );

  // Wrap SDK mutation to add mobile-specific Hive notification marking
  return {
    ...sdkMutation,
    mutate: async (notificationId?: string) => {
      // Call SDK mutation (handles optimistic updates and Ecency API)
      await sdkMutation.mutateAsync({ id: notificationId });

      // Mobile-specific: Also mark Hive notifications when marking all
      if (!notificationId) {
        try {
          await markHiveNotifications(currentAccount, pinHash);
          console.log('Hive notifications marked as Read');
        } catch (err) {
          Sentry.captureException(err);
        }
      }
    },
  };
};
