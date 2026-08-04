import { MAX_SEARCH_QUERY_LENGTH, MAX_SEARCH_TAGS, SearchQuery, SearchType } from '@ecency/sdk';

export type SearchDateOption = 'week' | 'month' | 'year' | 'all';
export type SearchSortOption = 'relevance' | 'popularity' | 'newest';

export interface SearchFilters {
  author: string;
  category: string;
  tags: string;
  type: SearchType;
  date: SearchDateOption;
  sort: SearchSortOption;
}

export const EMPTY_SEARCH_FILTERS: SearchFilters = {
  author: '',
  category: '',
  tags: '',
  // Posts, not All: this is the posts tab and it has always searched posts
  // only. "All" is an explicit opt-in to include comments.
  type: SearchType.POST,
  date: 'all',
  sort: 'relevance',
};

export function activeSearchFilterCount(filters: SearchFilters): number {
  return (Object.keys(EMPTY_SEARCH_FILTERS) as (keyof SearchFilters)[]).filter(
    (key) => filters[key] !== EMPTY_SEARCH_FILTERS[key],
  ).length;
}

export function hasActiveSearchFilters(filters: SearchFilters): boolean {
  return activeSearchFilterCount(filters) > 0;
}

export interface SearchQueryValidationError {
  id:
    | 'search_result.filters.needs_criteria'
    | 'search_result.filters.too_many_tags'
    | 'search_result.filters.too_long';
  values?: { n: number };
}

/** Mirrors the search API's query_validator for the exact q being sent. */
export function validateSearchQuery(q: string): SearchQueryValidationError | undefined {
  const parsed = new SearchQuery(q);

  if (!parsed.search && !parsed.author && !parsed.category && parsed.tags.length === 0) {
    return { id: 'search_result.filters.needs_criteria' };
  }
  if (parsed.tags.length > MAX_SEARCH_TAGS) {
    return { id: 'search_result.filters.too_many_tags', values: { n: MAX_SEARCH_TAGS } };
  }
  if (q.length > MAX_SEARCH_QUERY_LENGTH) {
    return { id: 'search_result.filters.too_long', values: { n: MAX_SEARCH_QUERY_LENGTH } };
  }
  return undefined;
}
