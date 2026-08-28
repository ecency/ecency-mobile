---
name: add-query
description: Use when reading server data in the mobile app - wiring an @ecency/sdk query option into a screen, adding or editing a hook under src/providers/queries/, paginating a feed or list with an infinite query, or fixing a query key, enabled guard, or cache persistence problem.
argument-hint: [query-name]
---

# Add Query

Read `CLAUDE.md` first (State Management, SDK Migration). Writes are a separate skill: `add-mutation`.

## Rule: the SDK owns the fetch

`@ecency/sdk` 2.3.93 exports **165** `get*QueryOptions` helpers. 25 of the 32 non-test files under
`src/providers/queries/` import from `@ecency/sdk`; only **2** `queryFn:` remain in that whole
directory. Search the SDK for your own domain first. Write a `queryFn` only when that search comes
back empty:

```bash
D=node_modules/@ecency/sdk/dist/browser/index.d.ts
test -f "$D" || echo 'SDK not installed, run yarn'   # a missing file greps as empty, a false all-clear
grep -o "get[A-Za-z]*QueryOptions" "$D" | sort -u | grep -i draft   # swap in your domain
grep -n "declare function getPostQueryOptions" "$D"
```

Drop the trailing `| grep -i draft` to list all 165. The last grep gives the real argument order.
Never guess it. `getPostQueryOptions(author, permlink?, observer?, num?)` takes the observer third.
13 of its 14 call sites pass one.

## 1. Straight from a component

```typescript
import { useQuery } from '@tanstack/react-query';
import { getPostQueryOptions, getAccountFullQueryOptions } from '@ecency/sdk';

const observer = currentAccount?.name;
const { data: post, isLoading } = useQuery(getPostQueryOptions(author, permlink, observer));
const { data: account } = useQuery(getAccountFullQueryOptions(author));
```

## 2. App hook that adds mobile-only options

The dominant shape: spread the SDK options, then override. 47 spread sites across `src/`.
Verbatim, `src/providers/queries/leaderboardQueries/leaderboardQueries.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getDiscoverLeaderboardQueryOptions } from '@ecency/sdk';

/** hook used to return leaderboard data using SDK */
export const useGetLeaderboardQuery = (duration: 'day' | 'week' | 'month') => {
  return useQuery({
    ...getDiscoverLeaderboardQueryOptions(duration),
    // Opted in explicitly: the client default is off, because waking every query in
    // the cache on every resume is far more than this needs. The board lives inside a
    // tab that stays mounted, so without this it shows whatever it fetched hours ago
    // until the user thinks to pull to refresh.
    refetchOnWindowFocus: true,
  });
};
```

Usual overrides: `enabled`, `select`, `staleTime`, `gcTime`, `initialData`. Keep the SDK's
`queryKey` plus `queryFn` so the cache entry stays shared with every other surface.

## 3. Private-API queries need the auth pair

Ecency backend queries take `username` plus an access token. Use `useAuth()` (12 query files do),
never re-derive it. From `src/providers/queries/newsletterQueries.ts`:

```typescript
import { useAuth } from '../../hooks';

export const useDigestSubscriptionsQuery = () => {
  const { username, code } = useAuth();
  return useQuery(getDigestSubscriptionsQueryOptions(username, code));
};
```

## 4. Infinite queries

SDK `get*InfiniteQueryOptions` already carry `initialPageParam` plus `getNextPageParam`. The repo
hand-rolls those two exactly once out of 18 `useInfiniteQuery` calls. Flatten in the hook, do not
re-key. From `src/providers/queries/draftQueries.ts` (comments stripped):

```typescript
const { username, code } = useAuth();
const enabled = !!username && !!code;

const infiniteQuery = useInfiniteQuery({
  ...getDraftsInfiniteQueryOptions(username ?? '', code ?? '', limit),
  enabled,
});

const data = useMemo(() => {
  if (!infiniteQuery.data?.pages) return [];
  return infiniteQuery.data.pages.flatMap((page) => page.data);
}, [infiniteQuery.data?.pages]);

return { ...infiniteQuery, data, pagesLoaded: infiniteQuery.data?.pages?.length ?? 0 };
```

## 5. Query keys

- **SDK keys**: `import { QueryKeys } from '@ecency/sdk'`. Namespaced factories, not strings:
  `QueryKeys.posts.draftsInfinite(username, limit)`, `QueryKeys.accounts.full(name)`,
  `QueryKeys.polls.details(author, permlink)`. Use these to invalidate or seed an SDK cache entry.
- **Mobile-only keys**: `src/providers/queries/queryKeys.ts` is a *default* export named `QUERIES`
  with a nested shape. 10 files import that default (`import QUERIES from '<relative>/queryKeys'`,
  so the specifier depends on the file) then `queryKey: [QUERIES.WALLET.GET_ACTIVITIES, username]`.
  There is no local `QueryKeys` export.

## 6. Hand-rolled query (last resort)

Only when the SDK has nothing. Verbatim, one of the two survivors,
`src/providers/queries/settingsQueries.ts`:

```typescript
export const useGetServersQuery = () => {
  return useQuery<string[]>({
    queryKey: [QUERIES.SETTINGS.GET_SERVERS],
    queryFn: getNodes,
    placeholderData: [...SERVER_LIST],
    staleTime: 0,
  });
};
```

`getNodes` comes from `src/providers/ecency/ecency.ts`, a provider module, not a bare fetch.

## 7. Export

`src/providers/queries/index.ts` uses `export * from './<domain>Queries'` (16 of them). Its only
named re-export is `getQueryClient` from the SDK; the rest of the file is local (`initQueryClient`
plus the persistence allowlist). A subdirectory carries its own `index.ts` that re-exports
namespaces, for example `export { postQueries, wavesQueries, pollQueries };`.

## Gotchas

1. **Persistence is an allowlist.** `_shouldDehydrateQuery` in `src/providers/queries/index.ts`
   switches on `queryKey[0]`, then narrows on `queryKey[1]`. Only `core`, `get-account-full` plus
   `points` persist wholesale. `posts`, `accounts`, `notifications` persist part of their subtypes:
   `accounts` returns false unless the subtype is `bookmarks` or `favorites`, `posts` drops `entry`,
   `notifications` drops `announcements`. Everything else is dropped, so a new namespace or subtype
   is not persisted until you add its case. Read the switch before assuming a new key persists.
   Infinite lists persist only while a single page is loaded.
2. **Guard with `enabled`** whenever a param can be undefined: 27 uses under `providers/queries`
   (`grep -rnE "^[[:space:]]*enabled[,:]" src/providers/queries | wc -l`). An `undefined` anywhere
   in a query key also blocks persistence.
3. Returning `undefined` from `getNextPageParam` stops pagination. `null` stops it too on the
   installed TanStack Query 5.83.0, whose `hasNextPage` tests `!= null`, but the repo's one
   hand-rolled case returns `undefined`.
4. **Optimistic vote data is no longer Redux.** Call `updateVoteInQueryCaches()` and read back via
   `applyRecentVoteOverrideToEntry()` from `src/providers/queries/postQueries/voteCacheUtils.ts`;
   seed a post before navigation with `usePostsCachePrimer()`. `useInjectVotesCache` is gone.
5. **Non-React code**: import `getQueryClient` from the app barrel `providers/queries` (19 sites)
   rather than the SDK (5): `await queryClient.fetchQuery(getAccountsQueryOptions([username]))`.
6. `src/providers/queries/sdk-config.ts` runs once from `initQueryClient()` and configures
   `ConfigManager` (query client, private API host, image host, Hive nodes, DMCA lists). Adding a
   query never requires touching it.

Prettier width is 100 (`.prettierrc`). Finish with `yarn lint` plus `yarn typecheck`; the baseline
in `tsc-baseline.json` is empty, so any type error fails CI.
