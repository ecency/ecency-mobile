import { useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBookmarksInfiniteQueryOptions,
  getFavouritesInfiniteQueryOptions,
  useBookmarkAdd,
  useBookmarkDelete,
  useAccountFavouriteAdd,
  useAccountFavouriteDelete,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode } from '../hive/dhive';

/**
 * Get username and access token from Redux state
 * Used internally by mutation hooks to access auth credentials
 */
const useAuth = () => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const digitPinCode = getDigitPinCode(pinHash);

  const username = currentAccount?.name;
  const accessToken = currentAccount?.local?.accessToken
    ? decryptKey(currentAccount.local.accessToken, digitPinCode)
    : undefined;

  return { username, code: accessToken };
};

/**
 * Hook to return user bookmarks with infinite scroll pagination
 * Uses SDK's getBookmarksInfiniteQueryOptions for efficient data loading
 *
 * @param limit - Number of items to load per page (default: 20)
 * @returns Flattened bookmarks array with pagination controls
 */
export const useGetBookmarksQuery = (limit = 20) => {
  const { username, code } = useAuth();

  const infiniteQuery = useInfiniteQuery(getBookmarksInfiniteQueryOptions(username, code, limit));

  // Flatten pages into single array and sort by timestamp
  const data = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    const flattened = infiniteQuery.data.pages.flatMap((page) => page.data);
    return flattened.sort((a, b) => {
      const dateA = a.timestamp;
      const dateB = b.timestamp;
      return dateB - dateA;
    });
  }, [infiniteQuery.data?.pages]);

  return {
    ...infiniteQuery,
    data,
  };
};

/**
 * Hook to return user favourites with infinite scroll pagination
 * Uses SDK's getFavouritesInfiniteQueryOptions for efficient data loading
 *
 * @param limit - Number of items to load per page (default: 20)
 * @returns Flattened favourites array with pagination controls
 */
export const useGetFavouritesQuery = (limit = 20) => {
  const { username, code } = useAuth();

  const infiniteQuery = useInfiniteQuery(getFavouritesInfiniteQueryOptions(username, code, limit));

  // Flatten pages into single array and sort by timestamp
  const data = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    const flattened = infiniteQuery.data.pages.flatMap((page) => page.data);
    return flattened.sort((a, b) => {
      const dateA = a.timestamp;
      const dateB = b.timestamp;
      return dateB - dateA;
    });
  }, [infiniteQuery.data?.pages]);

  return {
    ...infiniteQuery,
    data,
  };
};

/**
 * Hook to add a bookmark
 * Uses SDK's useBookmarkAdd hook with mobile-specific error handling
 */
export const useAddBookmarkMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  return useBookmarkAdd(
    username,
    code,
    () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};

/**
 * Hook to delete a bookmark
 * Uses SDK's useBookmarkDelete hook with mobile-specific error handling
 */
export const useDeleteBookmarkMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  return useBookmarkDelete(
    username,
    code,
    () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};

/**
 * Hook to add a favourite
 * Uses SDK's useAccountFavouriteAdd hook with mobile-specific error handling
 */
export const useAddFavouriteMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  return useAccountFavouriteAdd(
    username,
    code,
    () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};

/**
 * Hook to delete a favourite
 * Uses SDK's useAccountFavouriteDelete hook with mobile-specific error handling
 */
export const useDeleteFavouriteMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  return useAccountFavouriteDelete(
    username,
    code,
    () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};
