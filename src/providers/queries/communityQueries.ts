import { useInfiniteQuery } from '@tanstack/react-query';
import { bridgeApiCall } from '@ecency/sdk';

export const SUBSCRIBERS_PAGE_SIZE = 100;

/**
 * A subscriber row as hivemind returns it: `[account, role, title, joined]`.
 * Positional, like `community.team`.
 */
export type SubscriberRow = string[];

/**
 * Paginated community subscriber list.
 *
 * The SDK's `getCommunitySubscribersQueryOptions` issues a single
 * `list_subscribers({ community })` call, and hivemind caps that at 100 rows.
 * Communities are routinely far larger than that (ecency's own has ~11.7k), so
 * a single call silently returns the first 100 accounts alphabetically and
 * presents them as the whole roster. This pages with the documented
 * `last` + `limit` cursor instead, where `last` is the previous page's final
 * account name.
 */
export const communitySubscribersQueryKey = (community: string) => [
  'communities',
  'subscribers',
  'infinite',
  community,
];

export const useCommunitySubscribersQuery = (community: string, enabled = true) =>
  useInfiniteQuery({
    queryKey: communitySubscribersQueryKey(community),
    enabled: enabled && !!community,
    initialPageParam: '',
    queryFn: async ({ pageParam }) => {
      const params: Record<string, unknown> = { community, limit: SUBSCRIBERS_PAGE_SIZE };
      // hivemind treats an empty `last` as a real cursor positioned before the
      // first account and returns zero rows, so it has to be omitted on the
      // first page rather than passed as ''. Verified against api.hive.blog:
      // `{community, limit}` returns 100 rows, `{community, last: '', limit}`
      // returns 0.
      if (pageParam) {
        params.last = pageParam;
      }
      return (await bridgeApiCall<SubscriberRow[]>('list_subscribers', params)) ?? [];
    },
    getNextPageParam: (lastPage: SubscriberRow[]) => {
      // A short page means the end of the list. Returning undefined stops paging.
      if (!lastPage?.length || lastPage.length < SUBSCRIBERS_PAGE_SIZE) {
        return undefined;
      }
      return lastPage[lastPage.length - 1]?.[0];
    },
  });

/** Shape of the cached infinite subscribers query. */
export interface SubscribersCache {
  pages?: SubscriberRow[][];
  pageParams?: unknown[];
}

const ACCOUNT_INDEX = 0;
const TITLE_INDEX = 2;

/**
 * Rewrites one account's role in the cached subscriber pages, preserving the
 * rest of each tuple.
 *
 * Used after a successful setRole instead of invalidating. setRole broadcasts
 * async, so mutateAsync resolves on mempool acceptance and any refetch issued
 * now returns pre-transaction state from hivemind. The SDK patches the cached
 * community `team` for the same reason, but never touches the subscriber list,
 * which is what the roster falls back to once a demotion drops an account off
 * the team.
 */
export const applyRoleToSubscribersCache = (
  cached: SubscribersCache | undefined,
  account: string,
  role: string,
): SubscribersCache | undefined => {
  if (!cached?.pages) {
    return cached;
  }

  return {
    ...cached,
    pages: cached.pages.map((page) =>
      page.map((tuple) =>
        tuple?.[ACCOUNT_INDEX] === account
          ? [tuple[ACCOUNT_INDEX], role, ...tuple.slice(TITLE_INDEX)]
          : tuple,
      ),
    ),
  };
};

export const ACTIVITIES_PAGE_SIZE = 50;

/** An activity entry as hivemind returns it. */
export interface CommunityActivity {
  id: string;
  msg: string;
  url: string;
  date: string;
  type: string;
}

export const communityActivitiesQueryKey = (community: string) => [
  'communities',
  'account-notifications',
  'infinite',
  community,
];

/**
 * Resolves the cursor for the next page: the last entry's id, or undefined at
 * the end of the log.
 *
 * A short page means there is nothing after it. Exported so the stop conditions
 * are testable without a network round trip.
 */
export const getActivitiesNextPageParam = (lastPage: CommunityActivity[]): string | undefined => {
  if (!lastPage?.length || lastPage.length < ACTIVITIES_PAGE_SIZE) {
    return undefined;
  }
  return lastPage[lastPage.length - 1]?.id;
};

/**
 * Paginated community activity log.
 *
 * The SDK's `getAccountNotificationsInfiniteQueryOptions` wraps its fetch in
 * `try { ... } catch { return [] }`, so a failed request is indistinguishable
 * from an empty log: `isError` never becomes true, the screen reports "no
 * activity" for an RPC outage, and a failed page ends pagination silently
 * because an empty page yields no cursor. This lets the error surface.
 */
export const useCommunityActivitiesQuery = (community: string, enabled = true) =>
  useInfiniteQuery({
    queryKey: communityActivitiesQueryKey(community),
    enabled: enabled && !!community,
    initialPageParam: '',
    queryFn: async ({ pageParam }) =>
      (await bridgeApiCall<CommunityActivity[]>('account_notifications', {
        account: community,
        limit: ACTIVITIES_PAGE_SIZE,
        // Unlike list_subscribers, an explicit null here behaves the same as
        // omitting it, but stay consistent and only send a real cursor.
        last_id: pageParam || undefined,
      })) ?? [],
    getNextPageParam: getActivitiesNextPageParam,
  });
