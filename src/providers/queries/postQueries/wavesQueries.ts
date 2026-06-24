import {
  InfiniteData,
  QueryKey,
  UseMutationOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { isArray } from 'lodash';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  getAccountPosts,
  getPromotedPostsQuery,
  getWavesFeedQueryOptions,
  useDeleteComment,
  WaveEntry,
} from '@ecency/sdk';

import { parsePost } from '../../../utils/postParser';
import { WAVES_PRIMARY_HOST } from '../../../constants/waves';
import { useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useBotAuthorsQuery } from './postQueries';
import { selectCurrentAccount, selectCurrentAccountMutes } from '../../../redux/selectors';
import { useAuthContext } from '../../sdk';

type CombinedWavesQueryOptions = ReturnType<typeof getWavesFeedQueryOptions>;

/**
 * Drives a waves feed from the single combined, cross-container esync endpoint.
 * Every flavour (for-you / following / tag / account) is powered by the same
 * hook; the flavour is encoded entirely in the `queryOptions` passed in, built
 * via `getWavesFeedQueryOptions({ observer, following, tag, author })`. One
 * keyset-paginated infinite query backs the list — the per-container
 * primary/fallback host chaining is gone, the backend already merges every
 * container in time order. This hook layers the shared visibility filter,
 * promoted-wave interleaving, optimistic delete and pull-to-refresh on top.
 */
export const useWavesQuery = (
  queryOptions: CombinedWavesQueryOptions,
  // When true (for-you / following feeds, not tag feeds), promoted waves are
  // fetched and interleaved into the list like the web waves feed.
  injectPromoted = false,
  // When true (the firehose feeds), waves from authors the viewer mutes are
  // dropped client-side. Pass false for the profile author feed: you opened
  // that profile on purpose, so a mute of theirs must not blank their waves
  // (consistent with that feed omitting the server-side `observer`).
  applyMuteFilter = true,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const intl = useIntl();

  const mutes = useAppSelector(selectCurrentAccountMutes);
  const currentAccount = useAppSelector(selectCurrentAccount);

  const botAuthorsQuery = useBotAuthorsQuery();
  const authContext = useAuthContext();
  const sdkDeleteMutation = useDeleteComment(currentAccount?.name, authContext, 'async');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const wavesQuery = useInfiniteQuery({
    ...queryOptions,
    refetchInterval: 60000,
  });

  // Promoted waves (only for for-you / following feeds, never tag feeds). The
  // SDK keys this separately from the home-feed promoted query, so the two
  // never collide. Interleaved into the list below, like the web waves feed.
  const promotedQuery = useQuery({
    ...getPromotedPostsQuery<WaveEntry>('waves'),
    enabled: injectPromoted,
  });

  const data = useMemo(() => {
    const flatData: WaveEntry[] = wavesQuery.data?.pages?.flat() ?? [];
    const botAuthors = botAuthorsQuery.data ?? [];

    // Shared visibility filter: drop empty parses, muted authors, downvoted /
    // gray waves, and bot authors. Applied to BOTH organic and promoted waves
    // so the user's own mutes (and bot/gray hiding) hold even for promoted cards.
    // Server-side observer-mute already excludes muted authors from the combined
    // feed; this client filter stays as a backstop (and still covers promoted
    // cards, which bypass the feed query).
    const isVisibleWave = (post: any) => {
      if (!post) {
        return false;
      }
      // discard wave if author is muted (skipped for the profile author feed)
      if (applyMuteFilter && isArray(mutes) && mutes.indexOf(post.author) >= 0) {
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
      return true;
    };

    const parsed = flatData
      // Shallow-copy before parsing: parsePost mutates its argument, and `flatData`
      // holds the SDK query cache objects (mutating re-renders the body each refetch).
      // The SDK normalizes `created` on the combined feed, so no client-side
      // timestamp mapping is needed here. Organic waves are never promoted (isPromoted=false).
      .map((item) => parsePost({ ...item }, currentAccount?.name, false))
      .filter(isVisibleWave);

    if (!injectPromoted || !Array.isArray(promotedQuery.data) || !promotedQuery.data.length) {
      return parsed;
    }

    // Interleave promoted waves exactly like the web feed (waves-list-view):
    // parse as promoted, apply the same visibility filter, drop organic copies
    // (keep the promoted version), then splice promoted cards in at the web
    // cadence until the queue drains.
    const promotedWaves = promotedQuery.data
      .map((item) => parsePost({ ...item }, currentAccount?.name, true))
      .filter(isVisibleWave);
    if (!promotedWaves.length) {
      return parsed;
    }
    const promotedKeys = new Set(promotedWaves.map((wave) => `${wave.author}/${wave.permlink}`));
    const queue = [...promotedWaves];
    return parsed
      .filter((post) => !promotedKeys.has(`${post.author}/${post.permlink}`))
      .reduce((acc, post, index) => {
        acc.push(post);
        // Matches the web feed's cadence (`index % 4 === 1`): the first promoted
        // card appears after the 2nd organic wave, then after every 4th.
        if (index % 4 === 1 && queue.length) {
          const promoted = queue.shift();
          if (promoted) {
            acc.push(promoted);
          }
        }
        return acc;
      }, [] as typeof parsed);
  }, [
    wavesQuery.data,
    mutes,
    applyMuteFilter,
    botAuthorsQuery.data,
    currentAccount?.name,
    promotedQuery.data,
    injectPromoted,
  ]);

  const hasNextPage = !!wavesQuery.hasNextPage;
  const { isFetchingNextPage, isLoading } = wavesQuery;

  const fetchNextPage = useCallback(() => {
    if (wavesQuery.hasNextPage && !wavesQuery.isFetchingNextPage) {
      return wavesQuery.fetchNextPage();
    }
    return undefined;
  }, [wavesQuery.hasNextPage, wavesQuery.isFetchingNextPage, wavesQuery.fetchNextPage]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await wavesQuery.refetch();
      // Keep interleaved promoted waves fresh on pull-to-refresh too; skip when
      // promoted injection is off (tag feeds / profile tab) so we don't fire a
      // disabled query.
      if (injectPromoted) {
        await promotedQuery.refetch();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Memoized so its identity is stable across renders. WavesFeed's
  // registration effect depends on this function; without memoization the
  // effect re-fires on every parent render, registering/unregistering the
  // feed's slot in the parent's deleter Map and briefly leaving the slot
  // empty between cleanup and re-register.
  const deleteWave = useCallback(
    async ({
      _permlink,
      _parent_permlink,
      _parent_author,
    }: {
      _permlink: string;
      _parent_permlink: string;
      _parent_author?: string;
    }) => {
      if (!currentAccount?.name) {
        return;
      }

      // Each wave carries its own container account (its parent_author), which
      // decides which container to broadcast the delete against. Fall back to
      // the primary host only for callers that don't carry it.
      const targetHost = _parent_author || WAVES_PRIMARY_HOST;

      try {
        await sdkDeleteMutation.mutateAsync({
          author: currentAccount.name,
          permlink: _permlink,
          parentAuthor: targetHost,
          parentPermlink: _parent_permlink,
        });

        // Prune the wave from this feed's combined-feed cache. Match author too
        // — a permlink is only unique per author, so filtering on permlink alone
        // could drop another user's wave that happens to share it.
        queryClient.setQueryData<InfiniteData<WaveEntry[]>>(queryOptions.queryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.filter((w) => !(w.author === currentAccount.name && w.permlink === _permlink)),
            ),
          };
        });

        dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
      } catch (error) {
        console.error('Failed to delete wave:', error);
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.error' })));
      }
    },
    [
      currentAccount?.name,
      // Use `mutateAsync` (stable across renders via TanStack Query's
      // internal ref) rather than the whole mutation result object, which
      // gets a fresh identity on every state transition (idle → pending →
      // success/error) and would re-rotate `deleteWave` after each delete.
      sdkDeleteMutation.mutateAsync,
      queryOptions.queryKey,
      queryClient,
      dispatch,
      intl,
    ],
  );

  return {
    data,
    isRefreshing,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refresh,
    deleteWave,
  };
};

interface PublishWaveContext {
  previousData: InfiniteData<WaveEntry[]> | undefined;
  queryKey: QueryKey;
}

export const usePublishWaveMutation = () => {
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector(selectCurrentAccount);

  // A freshly posted wave belongs at the top of the for-you combined feed; its
  // cache key is the observer-scoped feed, where the observer is the poster.
  const observer = currentAccount?.name || undefined;

  const _mutationFn = async (cachePostData: any) => {
    // The optimistic prepend happens in onMutate (and is rolled back in
    // onError); this only validates the input. There is no return value —
    // nothing downstream consumes one.
    if (!cachePostData) {
      throw new Error('invalid mutations data');
    }
  };

  const _options: UseMutationOptions<void, unknown, any, PublishWaveContext> = {
    onMutate: async (cacheCommentData: any) => {
      const sdkOptions = getWavesFeedQueryOptions({ observer });

      await queryClient.cancelQueries({ queryKey: sdkOptions.queryKey });

      const previousData = queryClient.getQueryData<InfiniteData<WaveEntry[]>>(sdkOptions.queryKey);

      queryClient.setQueryData<InfiniteData<WaveEntry[]>>(sdkOptions.queryKey, (oldData) => {
        if (!oldData) {
          return { pages: [[cacheCommentData as WaveEntry]], pageParams: [undefined] };
        }
        const firstPage = oldData.pages[0] ?? [];
        return {
          ...oldData,
          pages: [[cacheCommentData as WaveEntry, ...firstPage], ...oldData.pages.slice(1)],
        };
      });

      return { previousData, queryKey: sdkOptions.queryKey };
    },

    onError: (_error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    // No invalidate on success: the combined feed is esync-backed and a just-
    // broadcast wave isn't indexed there yet, so an immediate refetch would drop
    // the optimistic card. The 60s refetchInterval (and pull-to-refresh)
    // reconciles the feed once esync has indexed it.
  };

  return useMutation({ mutationFn: _mutationFn, ..._options });
};

/**
 * Resolves the latest waves container to post a new wave into. Accepts an
 * ordered list of hosts and returns the most recent container from the first
 * host that has one — so new waves land on `hive.flow` when it has a
 * container, and fall back to `ecency.waves` otherwise.
 */
export const fetchLatestWavesContainer = async (hosts: string | readonly string[]) => {
  const hostList = Array.isArray(hosts) ? hosts : [hosts];
  let lastError: unknown;

  const fetchHostContainer = async (host: string) => {
    const result = (await getAccountPosts('posts', host, '', '', 1, undefined)) || [];
    return result[0];
  };

  type ContainerPost = Awaited<ReturnType<typeof fetchHostContainer>>;

  // Walk the hosts in order, resolving with the first one that has a
  // container. Chained `.then`s keep the attempts sequential (so we don't
  // hit every host when an earlier one already has a container) without an
  // eslint-restricted `for await` loop.
  const latestPost = await hostList.reduce<Promise<ContainerPost | undefined>>(
    (chain, host) =>
      chain.then((found) => {
        if (found) {
          return found;
        }
        return fetchHostContainer(host).catch((error) => {
          lastError = error;
          return undefined;
        });
      }),
    Promise.resolve(undefined),
  );

  if (!latestPost) {
    throw lastError ?? new Error('Latest waves container could not be fetched');
  }

  return latestPost;
};
