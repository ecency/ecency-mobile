import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { isArray } from 'lodash';
import { getShortsFeedQueryOptions, ShortsFeedEntry } from '@ecency/sdk';

import { parsePost } from '../../../utils/postParser';
import { useAppSelector } from '../../../hooks';
import { useBotAuthorsQuery } from './postQueries';
import { selectCurrentAccount, selectCurrentAccountMutes } from '../../../redux/selectors';

/**
 * Drives the cross-container Shorts (reels) feed from the esync
 * `/api/waves/shorts` endpoint via `getShortsFeedQueryOptions`. Same keyset
 * pagination and observer-mute model as the waves feed, but each entry carries
 * a `video` block for the vertical reels player and there's no promoted
 * interleaving or following filter (v1). Visibility filtering mirrors
 * `useWavesQuery` so muted/gray/bot authors stay hidden, plus a guard that only
 * shorts actually carrying a playable video reach the viewer.
 */
export const useShortsQuery = (observer?: string) => {
  const mutes = useAppSelector(selectCurrentAccountMutes);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const botAuthorsQuery = useBotAuthorsQuery();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const shortsQuery = useInfiniteQuery({
    ...getShortsFeedQueryOptions({ observer }),
    refetchInterval: 60000,
  });

  const data = useMemo(() => {
    const flat = (shortsQuery.data?.pages?.flat() ?? []) as ShortsFeedEntry[];
    const botAuthors = botAuthorsQuery.data ?? [];

    const isVisible = (post: any) => {
      if (!post) {
        return false;
      }
      // discard wave if author is muted
      if (isArray(mutes) && mutes.indexOf(post.author) >= 0) {
        return false;
      }
      // discard if wave is downvoted or marked gray
      if (post.isMuted) {
        return false;
      }
      // discard bot authors
      if (botAuthors.includes(post.author)) {
        return false;
      }
      // only shorts that actually carry a playable video belong in the reels viewer
      if (!post.video) {
        return false;
      }
      return true;
    };

    return (
      flat
        // Shallow-copy before parsing: parsePost mutates its argument, and `flat`
        // holds the SDK query cache objects. parsePost preserves the `video` field.
        .map((item) => parsePost({ ...item }, currentAccount?.name, false) as ShortsFeedEntry)
        .filter(isVisible)
    );
  }, [shortsQuery.data, mutes, botAuthorsQuery.data, currentAccount?.name]);

  const hasNextPage = !!shortsQuery.hasNextPage;
  const { isFetchingNextPage, isLoading } = shortsQuery;

  const fetchNextPage = useCallback(() => {
    if (shortsQuery.hasNextPage && !shortsQuery.isFetchingNextPage) {
      return shortsQuery.fetchNextPage();
    }
    return undefined;
  }, [shortsQuery.hasNextPage, shortsQuery.isFetchingNextPage, shortsQuery.fetchNextPage]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await shortsQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    data,
    isRefreshing,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refresh,
  };
};
