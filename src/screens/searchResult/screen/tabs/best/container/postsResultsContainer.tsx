import { useCallback, useMemo } from 'react';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  buildSearchQuery,
  getPostQueryOptions,
  getAccountPostsQueryOptions,
  getSearchApiInfiniteQueryOptions,
  SearchType,
} from '@ecency/sdk';
import ROUTES from '../../../../../../constants/routeNames';

import { postQueries } from '../../../../../../providers/queries';
import postUrlParser from '../../../../../../utils/postUrlParser';
import { selectCurrentAccountUsername } from '../../../../../../redux/selectors';
import { useAppSelector } from '../../../../../../hooks';

// Unlike the website, this app has never filtered low payout content. Keeping
// that, so results do not silently change under existing users.
const HIDE_LOW = false;

const DEFAULT_FILTERS = {
  author: '',
  category: '',
  tags: '',
  type: SearchType.ALL,
  date: 'all' as const,
  sort: 'relevance' as const,
};

// The API takes the window as an absolute timestamp, not a keyword.
const sinceFor = (date: string): string | undefined => {
  const days = date === 'week' ? 7 : date === 'month' ? 30 : date === 'year' ? 365 : 0;
  if (!days) {
    return undefined;
  }
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return since.toISOString().split('.')[0];
};

const PostsResultsContainer = ({ children, searchValue, filters = DEFAULT_FILTERS }) => {
  const navigation = useNavigation();
  const postsCacherPrimer = postQueries.usePostsCachePrimer();
  const currentAccountUsername = useAppSelector(selectCurrentAccountUsername);

  // Three modes, one query each, gated by `enabled` so only the applicable one
  // runs. React Query keys the search by its query string, so a response for an
  // abandoned search can no longer land on a newer one - which is what the
  // hand-rolled request-sequence guard existed for.
  const { author, permlink } = postUrlParser(searchValue) || {};
  const isPostUrl = !!(author && permlink);
  // A filter on its own is a complete search - "everything by @user" needs no
  // text, and the API has accepted filter-only queries since hivesearcher-api#10.
  // Keying this off the text alone left those searches disabled and the initial
  // Ecency posts on screen. Type and sort are not selective by themselves.
  const hasSelectiveFilter = !!(filters.author || filters.category || filters.tags);
  const isSearch = !isPostUrl && (!!searchValue || hasSelectiveFilter);

  const postQuery = useQuery({
    // Falls back to empty strings because this is built on every render, not
    // only when the value parses as a post URL. They never reach the network:
    // the query is disabled unless both are present.
    ...getPostQueryOptions(author ?? '', permlink ?? '', currentAccountUsername),
    enabled: isPostUrl,
  });

  const initialPostsQuery = useQuery({
    ...getAccountPostsQueryOptions(
      'ecency',
      'blog',
      undefined,
      undefined,
      7,
      currentAccountUsername,
    ),
    // Only when there is nothing to search for at all.
    enabled: !isSearch && !isPostUrl,
  });

  // Built by the SDK's buildSearchQuery, the same one the website uses, so the
  // tokens parse identically in the search API. Type defaults to post because
  // this is the posts tab; an explicit choice in the filters wins.
  // Memoized on the selected window rather than recomputed per render: `since`
  // is part of the React Query key, and a value derived from Date.now() changes
  // every second, which would swap the observer onto a fresh query mid
  // pagination and drop the pages already loaded.
  const since = useMemo(() => sinceFor(filters.date), [filters.date]);

  const { q } = buildSearchQuery({
    search: searchValue,
    author: filters.author,
    type: filters.type || SearchType.POST,
    category: filters.category,
    tags: filters.tags,
  });

  const searchQuery = useInfiniteQuery({
    ...getSearchApiInfiniteQueryOptions(q, filters.sort, HIDE_LOW, since),
    // The factory enables itself on a non-empty q, and q is never empty here
    // because of the type token. Gate on the real condition instead.
    enabled: isSearch,
  });

  const activeQuery = isPostUrl ? postQuery : isSearch ? searchQuery : initialPostsQuery;

  const data = useMemo(() => {
    if (isPostUrl) {
      return postQuery.data ? [postQuery.data] : [];
    }

    if (!isSearch) {
      return initialPostsQuery.data ?? [];
    }

    // author + permlink: a permlink is only unique per author, and the same one
    // can legitimately appear under two ("re-...", the same slugified title).
    // Scroll pages can overlap too, so dedupe as they are flattened.
    const seen = new Set<string>();
    return (searchQuery.data?.pages ?? [])
      .flatMap((page) => page?.results ?? [])
      .filter((item) => {
        const key = `${item.author}/${item.permlink}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }, [isPostUrl, isSearch, postQuery.data, initialPostsQuery.data, searchQuery.data]);

  const { isLoading } = activeQuery;
  // A failed search is not an empty one. The SDK keeps the backend's reason on
  // the error and will not retry a query it has already rejected, so this is
  // reached promptly rather than after four attempts.
  //
  // Only fatal when there is nothing to show. An infinite query raises the same
  // isError for a failed "show more", and the view swaps the whole list for its
  // error state, so without this a transient later-page failure would blank
  // results the user is already reading. The website makes the same call by
  // checking its error branch after the results branch.
  const isError = activeQuery.isError && data.length === 0;
  const noResult = !isLoading && !isError && data.length === 0;

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = searchQuery;
  const _loadMore = useCallback(() => {
    if (!isSearch || !hasNextPage || isFetchingNextPage) {
      return;
    }
    fetchNextPage();
  }, [isSearch, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Component Functions

  const _handleOnPress = (item) => {
    const itemAuthor = get(item, 'author');
    const itemPermlink = get(item, 'permlink');

    postsCacherPrimer.cachePost(item);
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      params: {
        author: itemAuthor,
        permlink: itemPermlink,
      },
      key: `${itemAuthor}/${itemPermlink}`,
    });
  };

  return (
    children &&
    children({
      data,
      handleOnPress: _handleOnPress,
      loadMore: _loadMore,
      noResult,
      isError,
      isLoading,
    })
  );
};

export default PostsResultsContainer;
