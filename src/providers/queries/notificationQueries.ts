import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import * as Sentry from '@sentry/react-native';
import { useMarkNotificationsRead, getNotificationsInfiniteQueryOptions } from '@ecency/sdk';
import { useAppDispatch, useAppSelector, useAuth } from '../../hooks';
import { updateUnreadActivityCount } from '../../redux/actions/accountAction';
import { toastNotification } from '../../redux/actions/uiAction';
import { NotificationFilters } from '../ecency/ecency.types';
import { markHiveNotifications, getDigitPinCode } from '../hive/dhive';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';

const FETCH_LIMIT = 20; // Fetch 20 notifications per page

/**
 * Hook to fetch notifications using SDK's infinite query
 * Migrated from custom useQueries implementation to SDK's getNotificationsInfiniteQueryOptions
 * @param filter - Notification filter (undefined for all notifications)
 */
export const useNotificationsQuery = (filter?: NotificationFilters) => {
  const { username, code } = useAuth();

  const sdkOptions = getNotificationsInfiniteQueryOptions(username, code, filter, FETCH_LIMIT);

  const infiniteQuery = useInfiniteQuery({
    ...sdkOptions,
    enabled: !!username && !!code, // Both are required for notifications
    staleTime: 0, // Always consider data stale so first page refreshes on mount
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    maxPages: 10, // Limit to 10 pages (200 items) maximum
    refetchOnMount: true, // Refetch first page on mount to show fresh data
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Flatten pages into single array for backwards compatibility
  const data = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    // SDK returns pages as arrays directly, not wrapped in { data: [...] }
    return infiniteQuery.data.pages
      .flatMap((page) => (Array.isArray(page) ? page : page.data || []))
      .filter((item) => item != null); // Filter out undefined/null items
  }, [infiniteQuery.data?.pages]);

  return {
    data,
    isRefreshing: infiniteQuery.isRefetching,
    isLoading: infiniteQuery.isLoading || infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    refresh: infiniteQuery.refetch,
    hasNextPage: infiniteQuery.hasNextPage,
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
  const username = currentAccount?.name;
  const accessToken =
    currentAccount?.local?.accessToken && digitPinCode
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
    isPending: sdkMutation.isPending,
    // Don't expose mutateAsync
  };
};
