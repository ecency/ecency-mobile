import { useQueries } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import * as Sentry from '@sentry/react-native';
import { useMarkNotificationsRead } from '@ecency/sdk';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateUnreadActivityCount } from '../../redux/actions/accountAction';
import { toastNotification } from '../../redux/actions/uiAction';
import { getNotifications } from '../ecency/ecency';
import { NotificationFilters } from '../ecency/ecency.types';
import { markHiveNotifications, getDigitPinCode } from '../hive/dhive';
import QUERIES from './queryKeys';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';

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

  // Memoize the data array to prevent infinite re-renders in RecyclerView
  const data = useMemo(() => unionBy(..._dataArrs, 'id'), [_dataArrs]);

  return {
    data,
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
  if (!digitPinCode) {
    Sentry.captureException(new Error('Failed to derive digitPinCode'));
  }
  const username = currentAccount?.name;
  const accessToken =
    currentAccount?.local?.accessToken && digitPinCode
      ? decryptKey(currentAccount.local.accessToken, digitPinCode)
      : undefined;
  if (!accessToken && currentAccount?.local?.accessToken) {
    Sentry.captureException(new Error('Credential derivation failed'));
  }

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
    mutate: (notificationId?: string) => {
      try {
        // Validate credentials before attempting mutation
        if (!username || !accessToken) {
          console.warn('Cannot mark notifications as read: missing credentials');
          dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
          return;
        }

        const payload = notificationId ? { id: notificationId } : {};
        sdkMutation.mutate(payload);

        // Mobile-specific: Also mark Hive notifications when marking all
        if (!notificationId) {
          markHiveNotifications(currentAccount, pinHash).catch((err) => {
            Sentry.captureException(err);
          });
        }
      } catch (error) {
        Sentry.captureException(error);
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      }
    },
    isLoading: sdkMutation.isLoading,
    isPending: sdkMutation.isPending,
    // Don't expose mutateAsync
  };
};
