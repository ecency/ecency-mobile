import { useRef, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query";
import QUERIES from "../../providers/queries/queryKeys";
import { fetchPostStats, recordPlausibleEvent } from "../../providers/plausible/plausible";



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
    const mutation = useMutation(
        (urlPath: string) => recordPlausibleEvent(urlPath), // The API call function
        {
            // Optional onSuccess or onError callback to handle response or errors
            onSuccess: (data) => {
                console.log('Event recorded successfully:', data);
            },
            onError: (error) => {
                console.error('Error recording event:', error);
            }
        }
    );

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
        isLoading: mutation.isLoading, // Optional: You can return the loading state if needed
        error: mutation.error, // Optional: You can return the error state if needed
    };
};



/**
 * Custom hook to fetch post stats based on a URL path, dimensions, and date range.
 *
 * @param {Object} params - The parameters for fetching post stats.
 * @param {string} params.initialUrlPath - The initial URL path for fetching stats.
 * @param {string[]} params.dimensions - The dimensions of the stats (e.g., categories, filters).
 * @param {string} params.dateRange - The date range for the stats (default is 'all').
 * @returns {Object} - An object with the setUrlPath function to set the URL path.
 */

export function usePostStatsQuery({
    initialUrlPath = '', // Default to an empty string if no initialUrlPath is provided
    dimensions = [], // Default to an empty array if no dimensions are provided
    dateRange = 'all' // Default to 'all' if no dateRange is provided
}) {
    const [urlPath, setUrlPath] = useState(initialUrlPath);

    const _setUrlPath = async (urlPath: string) => {
        setUrlPath(urlPath);
    };

    const _fetchStats = async () => {
        if (!urlPath) return null; // Don't fetch if urlPath is empty

        const stats = await fetchPostStats(urlPath, dimensions, dateRange);
        console.log("POST STATS", stats);
        return stats;
    };

    const query = useQuery(
        [QUERIES.PLAUSIBLE.GET_POST_STATS, urlPath, dateRange, JSON.stringify(dimensions)],
        _fetchStats,
        {
            enabled: !!urlPath, // Only enable the query if urlPath is not empty
            staleTime: 60000, // Set staleTime to 1 minute (60000 ms)
        }
    );

    return {
        ...query,
        setUrlPath: _setUrlPath,
    };
}