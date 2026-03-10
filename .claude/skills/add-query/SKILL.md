---
name: add-query
description: Use an @ecency/sdk query in the mobile app or create a new app-specific query
argument-hint: [query-name]
disable-model-invocation: true
---

# Add Query

Wire up SDK query options in the mobile app, or create app-specific queries.

## Using SDK Query Options (Preferred)

SDK queries are platform-agnostic and shared with the web app. Use them directly:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getPostQueryOptions, getAccountFullQueryOptions } from '@ecency/sdk';

function MyComponent({ author, permlink }) {
  const { data: post, isLoading } = useQuery(getPostQueryOptions(author, permlink));
  const { data: account } = useQuery(getAccountFullQueryOptions(author));
}
```

For non-React contexts (Redux thunks, utilities):

```typescript
import { getQueryClient } from '@ecency/sdk';
import { getAccountsQueryOptions } from '@ecency/sdk';

const queryClient = getQueryClient();
const accounts = await queryClient.fetchQuery(getAccountsQueryOptions([username]));
```

## Creating App-Specific Queries

For queries that are mobile-specific or not in the SDK, add them in `src/providers/queries/`.

### Query File Structure

Location: `src/providers/queries/<domain>Queries.ts` or `src/providers/queries/<domain>Queries/`

```typescript
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { QueryKeys } from './queryKeys';

// Simple query
export function useSomeDataQuery(param: string) {
  return useQuery({
    queryKey: [QueryKeys.SOME_DATA, param],
    queryFn: async () => {
      const response = await fetch(`https://api.ecency.com/some-endpoint/${param}`);
      return response.json();
    },
    enabled: !!param,
  });
}

// Infinite query (paginated)
export function useSomeListQuery(param: string) {
  return useInfiniteQuery({
    queryKey: [QueryKeys.SOME_LIST, param],
    queryFn: async ({ pageParam = '' }) => {
      return fetchSomeList(param, pageParam);
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 20) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    enabled: !!param,
  });
}
```

### Add Query Keys

Location: `src/providers/queries/queryKeys.ts`

```typescript
export const QueryKeys = {
  // ... existing keys
  SOME_DATA: 'SOME_DATA',
  SOME_LIST: 'SOME_LIST',
};
```

### Export

Add to `src/providers/queries/index.ts`:

```typescript
export { useSomeDataQuery } from './someQueries';
```

## SDK Configuration

SDK queries are configured in `src/providers/queries/sdk-config.ts`:

- `ConfigManager.setQueryClient(queryClient)` — shares the QueryClient
- `ConfigManager.setHiveNodes(nodes)` — configures RPC nodes with failover
- `ConfigManager.setPrivateApiHost(host)` — Ecency backend API
- `ConfigManager.setDmcaLists(lists)` — DMCA content filtering

This is called once at app startup. You don't need to touch it for new queries.

## Common Patterns

### Guard Undefined Params
Always use `enabled` to prevent queries from running with missing params:
```typescript
useQuery({
  queryKey: [QueryKeys.POST, author, permlink],
  queryFn: () => fetchPost(author!, permlink!),
  enabled: !!author && !!permlink,
});
```

### Cache Priming
For optimistic updates, use Redux cache reducer:
```typescript
import { useInjectVotesCache } from '../../hooks';
// Injects cached vote data into post objects
const posts = useInjectVotesCache(rawPosts);
```

### Wallet Queries
Wallet-specific queries live in `src/providers/queries/walletQueries/` and use SDK query options for blockchain data (delegations, balances, etc.).

## Common Gotchas

1. **Use SDK query options when available** — don't duplicate blockchain queries that exist in `@ecency/sdk`
2. **Don't forget `enabled`** — prevents queries from running before params are ready
3. **Return `undefined` from getNextPageParam** to stop pagination, not `null`
4. **Query cache persists** to AsyncStorage via TanStack Query persistence — be mindful of cache size
