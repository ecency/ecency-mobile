import { MAX_SEARCH_QUERY_LENGTH, MAX_SEARCH_TAGS, SearchType } from '@ecency/sdk';
import {
  activeSearchFilterCount,
  EMPTY_SEARCH_FILTERS,
  hasActiveSearchFilters,
  validateSearchQuery,
} from './searchFilters';

describe('search filter state', () => {
  it('does not count the default Posts type as an active filter', () => {
    expect(activeSearchFilterCount(EMPTY_SEARCH_FILTERS)).toBe(0);
    expect(hasActiveSearchFilters(EMPTY_SEARCH_FILTERS)).toBe(false);
  });

  it.each([SearchType.ALL, SearchType.COMMENT])('counts a changed type (%s)', (type) => {
    const filters = { ...EMPTY_SEARCH_FILTERS, type };

    expect(activeSearchFilterCount(filters)).toBe(1);
    expect(hasActiveSearchFilters(filters)).toBe(true);
  });
});

describe('validateSearchQuery', () => {
  it('rejects a type-only query after the search text is cleared', () => {
    expect(validateSearchQuery('type:comment')).toEqual({
      id: 'search_result.filters.needs_criteria',
    });
  });

  it('accepts selective filter-only queries', () => {
    expect(validateSearchQuery('author:demo type:post')).toBeUndefined();
  });

  it('enforces the tag and total-length caps', () => {
    const tags = Array.from({ length: MAX_SEARCH_TAGS + 1 }, (_, index) => `tag${index}`).join(',');
    expect(validateSearchQuery(`tag:${tags} type:post`)).toEqual({
      id: 'search_result.filters.too_many_tags',
      values: { n: MAX_SEARCH_TAGS },
    });

    expect(validateSearchQuery('x'.repeat(MAX_SEARCH_QUERY_LENGTH + 1))).toEqual({
      id: 'search_result.filters.too_long',
      values: { n: MAX_SEARCH_QUERY_LENGTH },
    });
  });
});
