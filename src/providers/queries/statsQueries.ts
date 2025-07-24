import { useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import QUERIES from './queryKeys';
import {
  fetchPostStats,
  fetchPostStatsByDimension,
  recordPlausibleEvent,
} from '../plausible/plausible';
import { PostStatsByCountry, PostStatsByDevice } from '../plausible/plausible.types';

/**
 * Custom hook to track events with Plausible Analytics.
 * Ensures that screen navigation events are only recorded once per component mount.
 *
 * @returns {Object} - An object containing:
 * - `recordEvent`: A function to record an event.
 * - `isLoading`: A boolean indicating if the mutation is in progress.
 * - `error`: The error object if the mutation fails.
 */

export const usePlausibleTracker = () => {
  // Makes sure screen navigated event is only recorded once per mount
  const screenEventRecorded = useRef(false);

  // Define the mutation to record an event
  const mutation = useMutation({
    mutationFn: (urlPath: string) => recordPlausibleEvent(urlPath), // The API call function

    // Optional onSuccess or onError callback to handle response or errors
    onSuccess: (data) => {
      console.log('Event recorded successfully:', data);
    },
    onError: (error) => {
      console.error('Error recording event:', error);
    },
  });

  const _recordEvent = (urlPath: string, isScreenEvent?: boolean) => {
    if (!isScreenEvent || !screenEventRecorded.current) {
      if (isScreenEvent) {
        screenEventRecorded.current = true;
      }

      // Trigger the mutation (API call)
      mutation.mutate(urlPath);
    }
  };

  return {
    recordEvent: _recordEvent,
    isLoading: mutation.isPending, // Optional: You can return the loading state if needed
    error: mutation.error, // Optional: You can return the error state if needed
  };
};

/**
 * Custom hook to fetch all post stats.
 *
 * @param {string} urlPath - The initial URL path for fetching stats.
 * @param {string} dateRange - The date range for the stats (default is 'all').
 * @returns {Object} - An object with the setUrlPath function to set the URL path.
 */

export const usePostStatsQuery = (urlPath: string, dateRange = 'all') =>
  useQuery({
    queryKey: [QUERIES.PLAUSIBLE.GET_POST_STATS, urlPath, dateRange],
    queryFn: () => fetchPostStats(urlPath, dateRange),
    enabled: !!urlPath, // Only enable the query if urlPath is not empty
    staleTime: 60000, // Set staleTime to 1 minute (60000 ms)
  });

/**
 * Custom hook to fetch post stats by country
 *
 * @param {string} urlPath - The initial URL path for fetching stats.
 * @param {string} dateRange - The date range for the stats (default is 'all').
 * @returns {Object} - An object with the setUrlPath function to set the URL path.
 */

export const usePostStatsByCountry = (urlPath: string, dateRange = 'all') =>
  useQuery({
    queryKey: [QUERIES.PLAUSIBLE.GET_POST_STATS_BY_COUNTRY, urlPath, dateRange],
    queryFn: () =>
      fetchPostStatsByDimension<PostStatsByCountry>(urlPath, dateRange, 'country_name'),
    enabled: !!urlPath, // Only enable the query if urlPath is not empty
    staleTime: 60000, // Set staleTime to 1 minute (60000 ms)
  });

/**
 * Custom hook to fetch post stats by device
 *
 * @param {string} urlPath - The initial URL path for fetching stats.
 * @param {string} dateRange - The date range for the stats (default is 'all').
 * @returns {Object} - An object with the setUrlPath function to set the URL path.
 */

export const usePostStatsByDevice = (urlPath: string, dateRange = 'all') =>
  useQuery({
    queryKey: [QUERIES.PLAUSIBLE.GET_POST_STATS_BY_DEVICE, urlPath, dateRange],
    queryFn: async () => fetchPostStatsByDimension<PostStatsByDevice>(urlPath, dateRange, 'device'),
    enabled: !!urlPath, // Only enable the query if urlPath is not empty
    staleTime: 60000, // Set staleTime to 1 minute (60000 ms)
  });
