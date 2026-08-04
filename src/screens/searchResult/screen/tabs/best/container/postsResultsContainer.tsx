import { useCallback, useMemo } from 'react';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getPostQueryOptions,
  getAccountPostsQueryOptions,
  getSearchApiInfiniteQueryOptions,
} from '@ecency/sdk';
import ROUTES from '../../../../../../constants/routeNames';

import { postQueries } from '../../../../../../providers/queries';
import postUrlParser from '../../../../../../utils/postUrlParser';
import { selectCurrentAccountUsername } from '../../../../../../redux/selectors';
import { useAppSelector } from '../../../../../../hooks';

// Where a sort filter would plug in. The screen has no control for it, and the
// unused state this replaces was hardcoded the same way.
const SORT = 'relevance';

// Unlike the website, this app has never filtered low payout content. Keeping
// that, so results do not silently change under existing users.
const HIDE_LOW = false;

const PostsResultsContainer = ({ children, searchValue }) => {
  const navigation = useNavigation();
  const postsCacherPrimer = postQueries.usePostsCachePrimer();
  const currentAccountUsername = useAppSelector(selectCurrentAccountUsername);

  // Three modes, one query each, gated by `enabled` so only the applicable one
  // runs. React Query keys the search by its query string, so a response for an
  // abandoned search can no longer land on a newer one - which is what the
  // hand-rolled request-sequence guard existed for.
  const { author, permlink } = postUrlParser(searchValue) || {};
  const isPostUrl = !!(author && permlink);
  const isSearch = !!searchValue && !isPostUrl;

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
    enabled: !searchValue,
  });

  const searchQuery = useInfiniteQuery({
    ...getSearchApiInfiniteQueryOptions(`${searchValue} type:post`, SORT, HIDE_LOW),
    // The factory enables itself on a non-empty q, and q is never empty here
    // because of the appended type:post. Gate on the real condition instead.
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

  const { isLoading, isError } = activeQuery;
  // A failed search is not an empty one. The SDK keeps the backend's reason on
  // the error and will not retry a query it has already rejected, so this is
  // reached promptly rather than after four attempts.
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
