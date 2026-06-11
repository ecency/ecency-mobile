import { useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStatsQueryOptions } from '@ecency/sdk';
import { recordPlausibleEvent } from '../plausible/plausible';
import {
  getDefaultPostStats,
  getMetricsListForPostStats,
  parsePostStatsByDimension,
  parsePostStatsResponse,
} from '../plausible/converters';
import { PostStatsByDevice, StatsResponse } from '../plausible/plausible.types';
import { stripCategoryFromPostPath } from '../../utils/post';

const POST_STATS_METRICS = getMetricsListForPostStats();
const STATS_STALE_TIME = 5 * 60 * 1000; // 5 minutes - stats don't change frequently
const STATS_GC_TIME = 30 * 60 * 1000; // Keep in cache for 30 minutes

/**
 * Plausible `date_range` scoped to a post's lifetime (created -> today). Bounding
 * the range lets ClickHouse prune by its time-ordered index and monthly partitions
 * instead of scanning all history. Returns undefined (-> 'all') when no created
 * date is available.
 */
export const getPostStatsDateRange = (created?: string): [string, string] | undefined => {
  if (!created) {
    return undefined;
  }
  const from = String(created).split('T')[0];
  const to = new Date().toISOString().split('T')[0];
  return [from, to];
};

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

  // Memoize the recordEvent function to prevent unnecessary re-renders
  const _recordEvent = useCallback(
    (urlPath: string, isScreenEvent?: boolean) => {
      if (!isScreenEvent || !screenEventRecorded.current) {
        if (isScreenEvent) {
          screenEventRecorded.current = true;
        }

        // Trigger the mutation (API call)
        mutation.mutate(urlPath);
      }
    },
    [mutation.mutate],
  );

  return {
    recordEvent: _recordEvent,
    isLoading: mutation.isPending, // Optional: You can return the loading state if needed
    error: mutation.error, // Optional: You can return the error state if needed
  };
};

/**
 * Fetch aggregate post stats (views/visitors/duration).
 *
 * Reads go through the shared SDK query (`getStatsQueryOptions` -> the server-side
 * `/api/stats` proxy), so the logic — date-scoping, canonical-path matching, the
 * stats API key — lives in one place shared with web instead of a mobile-only
 * client. `select` maps the raw Plausible response to the flat shape the UI wants.
 *
 * @param urlPath - Post path; reduced to its canonical `/@author/permlink` form.
 * @param dateRange - `[from, to]` lifetime window; omit for all-time.
 */
export const usePostStatsQuery = (urlPath: string, dateRange?: string | [string, string]) =>
  useQuery({
    ...getStatsQueryOptions({
      url: stripCategoryFromPostPath(urlPath),
      metrics: POST_STATS_METRICS,
      dateRange,
      enabled: !!urlPath,
    }),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    select: (response) => {
      try {
        return parsePostStatsResponse(response as unknown as StatsResponse);
      } catch {
        // A valid-but-empty result (e.g. a post with no views yet) -> zeros,
        // rather than surfacing a parse error to the UI.
        return getDefaultPostStats();
      }
    },
  });

/**
 * Fetch post stats broken down by device, via the same shared SDK query.
 *
 * @param urlPath - Post path; reduced to its canonical `/@author/permlink` form.
 * @param dateRange - `[from, to]` lifetime window; omit for all-time.
 */
export const usePostStatsByDevice = (urlPath: string, dateRange?: string | [string, string]) =>
  useQuery({
    ...getStatsQueryOptions({
      url: stripCategoryFromPostPath(urlPath),
      metrics: POST_STATS_METRICS,
      dimensions: ['visit:device'],
      dateRange,
      enabled: !!urlPath,
    }),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    select: (response) => {
      try {
        return parsePostStatsByDimension<PostStatsByDevice>(
          response as unknown as StatsResponse,
          'device',
        );
      } catch {
        // Mirror usePostStatsQuery: degrade an empty/odd result to an empty list
        // instead of erroring the device panel.
        return [] as PostStatsByDevice[];
      }
    },
  });
