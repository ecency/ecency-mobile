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
export const useCommunitySubscribersQuery = (community: string, enabled = true) =>
  useInfiniteQuery({
    queryKey: ['communities', 'subscribers', 'infinite', community],
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
