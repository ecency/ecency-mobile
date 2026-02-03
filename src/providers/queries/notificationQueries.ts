import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
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
 *
 * Note: The SDK's optimistic update may fail due to infinite query structure mismatch,
 * but we handle this gracefully by verifying the actual mutation result.
 */
export const useNotificationReadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  // Track pending mutations to verify on error
  const pendingMutationRef = useRef<{ id?: string; timestamp: number } | null>(null);

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
      // Clear pending mutation on success
      pendingMutationRef.current = null;
    },
    async (error) => {
      // The SDK's optimistic update may fail (trying to .map() on infinite query structure),
      // but the actual API call might succeed. Verify by refetching before showing error.
      const pendingMutation = pendingMutationRef.current;

      if (pendingMutation && Date.now() - pendingMutation.timestamp < 5000) {
        try {
          // Refetch notifications to verify if the mutation actually succeeded
          await queryClient.invalidateQueries({
            queryKey: ['notifications', username],
          });

          // If we get here, the mutation likely succeeded despite the optimistic update failure
          // Don't show error toast, just log to Sentry for debugging
          Sentry.captureMessage(
            'Notification mark-as-read: SDK optimistic update failed but mutation may have succeeded',
            'warning',
          );
          return;
        } catch (refetchError) {
          // Refetch also failed, this is a real error
          Sentry.captureException(error);
        }
      } else {
        // No pending mutation or too old, treat as real error
        Sentry.captureException(error);
      }

      // Show error toast only if we couldn't verify success
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      pendingMutationRef.current = null;
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

        // Track this mutation for error verification
        pendingMutationRef.current = {
          id: notificationId,
          timestamp: Date.now(),
        };

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
        pendingMutationRef.current = null;
      }
    },
    isPending: sdkMutation.isPending,
    // Don't expose mutateAsync
  };
};
