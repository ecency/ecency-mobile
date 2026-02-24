import { useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBookmarksInfiniteQueryOptions,
  getFavoritesInfiniteQueryOptions,
  useBookmarkAdd,
  useBookmarkDelete,
  useAccountFavoriteAdd,
  useAccountFavoriteDelete,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAuth } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';

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

  const infiniteQuery = useInfiniteQuery(getFavoritesInfiniteQueryOptions(username, code, limit));

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

  return useAccountFavoriteAdd(
    username,
    code,
    () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
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

  return useAccountFavoriteDelete(
    username,
    code,
    () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};
