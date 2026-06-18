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
  getWavesByHostQueryOptions,
  getWavesFollowingQueryOptions,
  getWavesByTagQueryOptions,
  getWavesByAccountQueryOptions,
  useDeleteComment,
  WaveEntry,
} from '@ecency/sdk';

import { parsePost } from '../../../utils/postParser';
import { WAVES_PRIMARY_HOST, WAVES_FALLBACK_HOST } from '../../../constants/waves';
import { useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useBotAuthorsQuery } from './postQueries';
import { selectCurrentAccount, selectCurrentAccountMutes } from '../../../redux/selectors';
import { useAuthContext } from '../../sdk';

type WavesQueryOptions =
  | ReturnType<typeof getWavesByHostQueryOptions>
  | ReturnType<typeof getWavesFollowingQueryOptions>
  | ReturnType<typeof getWavesByTagQueryOptions>
  | ReturnType<typeof getWavesByAccountQueryOptions>;

/**
 * Drives a waves feed across an ordered pair of container hosts. The primary
 * host (`hive.flow`) is paginated first; once it has no more containers — be
 * that because it has none at all or because scrolling exhausted them — the
 * fallback host (`ecency.waves`) is enabled and its waves are appended. The
 * two SDK queries stay independent; this hook just merges their pages and
 * presents a single feed-shaped API to the screen.
 *
 * `buildQueryOptions` is invoked once per host so the same feed flavour
 * (for-you / following / tag / account) can be requested from either account.
 */
export const useWavesQuery = (
  buildQueryOptions: (host: string) => WavesQueryOptions,
  hosts: { primary: string; fallback: string } = {
    primary: WAVES_PRIMARY_HOST,
    fallback: WAVES_FALLBACK_HOST,
  },
  // When true (for-you / following feeds, not tag feeds), promoted waves are
  // fetched and interleaved into the list like the web waves feed.
  injectPromoted = false,
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

  const primaryOptions = useMemo(
    () => buildQueryOptions(hosts.primary),
    [buildQueryOptions, hosts.primary],
  );
  const fallbackOptions = useMemo(
    () => buildQueryOptions(hosts.fallback),
    [buildQueryOptions, hosts.fallback],
  );

  // The SDK gates following/account feeds with their own `enabled` flag (e.g.
  // disabled until a username is known); honour it so we never force a query
  // the SDK intends to skip.
  const primaryBaseEnabled = (primaryOptions as { enabled?: boolean }).enabled ?? true;
  const fallbackBaseEnabled = (fallbackOptions as { enabled?: boolean }).enabled ?? true;

  // All SDK wave query options share the same runtime shape but differ in
  // page-param generics; cast to satisfy useInfiniteQuery.
  const primaryQuery = useInfiniteQuery({
    ...(primaryOptions as ReturnType<typeof getWavesByHostQueryOptions>),
    refetchInterval: 60000,
  });

  // The fallback host activates only once the primary has finished loading and
  // reports no further containers. That single condition covers both
  // "primary has nothing at all" and "primary exhausted while scrolling"; on a
  // primary error `hasNextPage` is false and `isFetched` true, so the feed
  // still falls back rather than dead-ending.
  const primaryExhausted =
    primaryBaseEnabled && primaryQuery.isFetched && !primaryQuery.hasNextPage;

  const fallbackQuery = useInfiniteQuery({
    ...(fallbackOptions as ReturnType<typeof getWavesByHostQueryOptions>),
    enabled: fallbackBaseEnabled && primaryExhausted,
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
    const primaryItems: WaveEntry[] = primaryQuery.data?.pages?.flat() ?? [];
    // Surface fallback items only while the primary is exhausted, so a primary
    // refetch that brings back fresh containers hides the fallback again
    // instead of interleaving the two sources.
    const fallbackItems: WaveEntry[] = primaryExhausted
      ? fallbackQuery.data?.pages?.flat() ?? []
      : [];
    const flatData: WaveEntry[] = [...primaryItems, ...fallbackItems];
    const botAuthors = botAuthorsQuery.data ?? [];

    // Shared visibility filter: drop empty parses, muted authors, downvoted /
    // gray waves, and bot authors. Applied to BOTH organic and promoted waves
    // so the user's own mutes (and bot/gray hiding) hold even for promoted cards.
    const isVisibleWave = (post: any) => {
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
      return true;
    };

    const parsed = flatData
      // Map esync's `timestamp` onto `created` so following / tag feeds show the
      // relative publish time like the for-you feed. Organic waves are never
      // promoted (isPromoted=false). Shallow-copy before parsing: parsePost mutates
      // its argument, and `flatData` holds the SDK query cache objects.
      .map((item) =>
        parsePost(
          { ...item, created: item.created || (item as any).timestamp },
          currentAccount?.name,
          false,
        ),
      )
      .filter(isVisibleWave);

    if (!injectPromoted || !Array.isArray(promotedQuery.data) || !promotedQuery.data.length) {
      return parsed;
    }

    // Interleave promoted waves exactly like the web feed (waves-list-view):
    // parse as promoted, apply the same visibility filter, drop organic copies
    // (keep the promoted version), then splice promoted cards in at the web
    // cadence until the queue drains.
    const promotedWaves = promotedQuery.data
      .map((item) =>
        parsePost(
          { ...item, created: item.created || (item as any).timestamp },
          currentAccount?.name,
          true,
        ),
      )
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
    primaryQuery.data,
    fallbackQuery.data,
    primaryExhausted,
    mutes,
    botAuthorsQuery.data,
    currentAccount?.name,
    promotedQuery.data,
    injectPromoted,
  ]);

  const primaryItemCount = primaryQuery.data?.pages?.flat()?.length ?? 0;

  // More remains if the primary still has pages, or it is exhausted and the
  // fallback either has more pages or hasn't yet loaded its first page.
  const hasNextPage =
    !!primaryQuery.hasNextPage ||
    (primaryExhausted &&
      (!!fallbackQuery.hasNextPage ||
        (fallbackBaseEnabled && !fallbackQuery.isFetched && !fallbackQuery.isError)));

  const isFetchingNextPage =
    primaryQuery.isFetchingNextPage ||
    fallbackQuery.isFetchingNextPage ||
    // The fallback's first page loads automatically (via `enabled`) once the
    // primary exhausts. Count that as "fetching" — including when the primary
    // had zero items — so callers don't see `hasNextPage && !isFetchingNextPage`
    // and fire a no-op `fetchNextPage()` (a no-op because the fallback has no
    // `hasNextPage` until its first page lands). An empty FlatList raises
    // `onEndReached` immediately, so without this it would loop on every scroll.
    (primaryExhausted && fallbackQuery.isLoading);

  const isLoading =
    primaryQuery.isLoading ||
    // Primary returned nothing and we're now loading the fallback's first page.
    (primaryExhausted && primaryItemCount === 0 && fallbackQuery.isLoading);

  const fetchNextPage = useCallback(() => {
    if (primaryQuery.hasNextPage) {
      return primaryQuery.fetchNextPage();
    }
    if (primaryExhausted && fallbackQuery.hasNextPage) {
      return fallbackQuery.fetchNextPage();
    }
    return undefined;
  }, [
    primaryQuery.hasNextPage,
    primaryQuery.fetchNextPage,
    primaryExhausted,
    fallbackQuery.hasNextPage,
    fallbackQuery.fetchNextPage,
  ]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await primaryQuery.refetch();
      // Only refetch the fallback if it actually loaded; otherwise its
      // `enabled` gate re-evaluates from the refreshed primary state.
      if (fallbackQuery.data) {
        await fallbackQuery.refetch();
      }
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

      // A wave's container account (its parent_author) decides which host to
      // broadcast the delete against. Fall back to the primary host for
      // callers that don't carry it.
      const targetHost = _parent_author || hosts.primary;

      try {
        await sdkDeleteMutation.mutateAsync({
          author: currentAccount.name,
          permlink: _permlink,
          parentAuthor: targetHost,
          parentPermlink: _parent_permlink,
        });

        // The merged feed may hold the wave under either host's key, so prune
        // both caches. Match author too — a permlink is only unique per author,
        // so filtering on permlink alone could drop another user's wave that
        // happens to share it.
        [primaryOptions.queryKey, fallbackOptions.queryKey].forEach((queryKey) => {
          queryClient.setQueryData<InfiniteData<WaveEntry[]>>(queryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.filter((w) => !(w.author === currentAccount.name && w.permlink === _permlink)),
              ),
            };
          });
        });

        dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
      } catch (error) {
        console.error('Failed to delete wave:', error);
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.error' })));
      }
    },
    [
      currentAccount?.name,
      hosts.primary,
      // Use `mutateAsync` (stable across renders via TanStack Query's
      // internal ref) rather than the whole mutation result object, which
      // gets a fresh identity on every state transition (idle → pending →
      // success/error) and would re-rotate `deleteWave` after each delete.
      sdkDeleteMutation.mutateAsync,
      primaryOptions.queryKey,
      fallbackOptions.queryKey,
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

  const _mutationFn = async (cachePostData: any) => {
    if (cachePostData) {
      const _host = cachePostData.parent_author;
      return _host;
    }
    throw new Error('invalid mutations data');
  };

  const _options: UseMutationOptions<string, unknown, any, PublishWaveContext> = {
    onMutate: async (cacheCommentData: any) => {
      const _host = cacheCommentData.parent_author;
      const sdkOptions = getWavesByHostQueryOptions(_host);

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

    onSuccess: async (host) => {
      const sdkOptions = getWavesByHostQueryOptions(host);
      queryClient.invalidateQueries({ queryKey: sdkOptions.queryKey });
    },
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
