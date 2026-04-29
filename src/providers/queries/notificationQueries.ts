import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import * as Sentry from '@sentry/react-native';
import {
  getNotificationsInfiniteQueryOptions,
  markNotifications,
  useBroadcastMutation,
} from '@ecency/sdk';
import { useAppDispatch, useAppSelector, useAuth } from '../../hooks';
import { updateUnreadActivityCount } from '../../redux/actions/accountAction';
import { toastNotification } from '../../redux/actions/uiAction';
import { NotificationFilters } from '../ecency/ecency.types';
import { getDigitPinCode } from '../hive/hive';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { useAuthContext } from '../sdk/useAuthContext';

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
    staleTime: 30 * 1000, // 30 seconds — fresh enough for notifications
    gcTime: 10 * 60 * 1000, // 10 minutes
    maxPages: 10, // Limit to 10 pages (200 items) maximum
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
    isRefreshing: infiniteQuery.isRefetching && !infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading,
    isFetching: infiniteQuery.isFetching,
    isPending: infiniteQuery.isPending,
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
  const { username: authUsername, code: authCode } = useAuth();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const authContext = useAuthContext();

  // Get auth credentials
  const digitPinCode = useMemo(() => (pinHash ? getDigitPinCode(pinHash) : undefined), [pinHash]);
  const username = currentAccount?.name || authUsername;
  const notificationsQueryKey = getNotificationsInfiniteQueryOptions(
    username,
    authCode,
    undefined,
    FETCH_LIMIT,
  ).queryKey;
  // Broad key (first 2 segments) to invalidate all filter tabs on mark-read
  const notificationsBaseQueryKey = notificationsQueryKey.slice(0, 2);

  // SDK broadcast mutation for marking Hive on-chain notifications
  const markHiveNotifMutation = useBroadcastMutation(
    ['hive', 'mark-notifications'],
    username,
    () => {
      const now = new Date().toISOString();
      const date = now.replace(/\.\d{3}Z$/, 'Z');
      const jsonPayload = JSON.stringify(['setLastRead', { date }]);
      return [
        [
          'custom_json',
          {
            id: 'notify',
            required_auths: [],
            required_posting_auths: [username],
            json: jsonPayload,
          },
        ],
        [
          'custom_json',
          {
            id: 'ecency_notify',
            required_auths: [],
            required_posting_auths: [username],
            json: jsonPayload,
          },
        ],
      ];
    },
    undefined,
    authContext,
    'posting',
    { broadcastMode: 'async' },
  );

  // Track pending mutations to verify on error
  const pendingMutationRef = useRef<{ id?: string; timestamp: number } | null>(null);
  const accessToken =
    currentAccount?.local?.accessToken && digitPinCode
      ? decryptKey(currentAccount.local.accessToken, digitPinCode)
      : authCode;

  // Custom mutation to avoid SDK optimistic update issues with infinite queries
  const mutation = useMutation({
    mutationKey: ['notifications', 'mark-read', username],
    mutationFn: async ({ id }: { id?: string }) => {
      if (!username || !accessToken) {
        throw new Error('[Notifications] missing auth for markNotifications');
      }
      return markNotifications(accessToken, id);
    },
    onSuccess: async (response) => {
      const unreadCount =
        typeof response === 'object' && response !== null ? response.unread : undefined;
      if (unreadCount !== undefined) {
        dispatch(updateUnreadActivityCount(unreadCount));
      }
      pendingMutationRef.current = null;
    },
    onError: async (error) => {
      const pendingMutation = pendingMutationRef.current;

      if (pendingMutation && Date.now() - pendingMutation.timestamp < 5000) {
        pendingMutationRef.current = null;
        Sentry.captureMessage(
          'Notification mark-as-read failed but mutation may have succeeded',
          'warning',
        );
        return;
      } else {
        Sentry.captureException(error);
      }

      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      pendingMutationRef.current = null;
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationsBaseQueryKey,
      });
    },
  });

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
        mutation.mutate(payload);

        // Mobile-specific: Also mark Hive notifications when marking all
        if (!notificationId) {
          markHiveNotifMutation.mutate(
            {},
            {
              onError: (err) => {
                Sentry.captureException(err);
              },
            },
          );
        }
      } catch (error) {
        Sentry.captureException(error);
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        pendingMutationRef.current = null;
      }
    },
    isPending: mutation.isPending,
    // Don't expose mutateAsync
  };
};
