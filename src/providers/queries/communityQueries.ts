import { QueryKeys, Subscription } from '@ecency/sdk';

/**
 * Cache key for the paged subscriber list.
 *
 * Re-exported from the SDK rather than rebuilt locally so the cache patch below
 * cannot drift from the query it patches.
 */
export const communitySubscribersQueryKey = (community: string) =>
  QueryKeys.communities.subscribersInfinite(community);

/** Shape of the cached infinite subscribers query. */
export interface SubscribersCache {
  pages?: Subscription[][];
  pageParams?: unknown[];
}

// hivemind returns each subscriber row as a positional tuple of
// [account, role, title, joined].
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
