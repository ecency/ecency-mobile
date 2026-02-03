import { useQuery } from '@tanstack/react-query';
import {
  getSearchApiInfiniteQueryOptions,
  getSearchAccountQueryOptions,
  getSearchPathQueryOptions,
  getSearchTopicsQueryOptions,
  searchQueryOptions,
} from '@ecency/sdk';

// Export as getSearchQueryOptions for backwards compatibility
// Fallback to searchQueryOptions if getSearchApiInfiniteQueryOptions isn't available at runtime.
export const getSearchQueryOptions =
  typeof getSearchApiInfiniteQueryOptions === 'function'
    ? getSearchApiInfiniteQueryOptions
    : (q: string, sort: string, hideLow: boolean) =>
        searchQueryOptions(q, sort, hideLow ? '1' : '0');

/**
 * Hook to search for posts/content
 * Uses SDK's search query options
 */
export const useSearchQuery = (
  query: string,
  sort: string = 'newest',
  hideLowRated: boolean = false,
) => {
  return useQuery({
    ...getSearchQueryOptions(query, sort, hideLowRated),
    enabled: !!query && query.length >= 3,
  });
};

/**
 * Hook to search for accounts
 * Uses SDK's account search query options
 */
export const useSearchAccountQuery = (query: string, limit: number = 20) => {
  return useQuery({
    ...getSearchAccountQueryOptions(query, limit),
    enabled: !!query && query.length >= 3,
  });
};

/**
 * Hook to search for a specific path (author/permlink)
 * Uses SDK's path search query options
 */
export const useSearchPathQuery = (query: string) => {
  return useQuery({
    ...getSearchPathQueryOptions(query),
    enabled: !!query && query.length >= 3,
  });
};

/**
 * Hook to search for topics/tags
 * Uses SDK's topics search query options
 */
export const useSearchTopicsQuery = (query: string, limit: number = 20) => {
  return useQuery({
    ...getSearchTopicsQueryOptions(query, limit),
    enabled: !!query && query.length >= 3,
  });
};
