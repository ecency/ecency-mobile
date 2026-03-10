---
name: add-mutation
description: Add a new blockchain mutation wrapper using @ecency/sdk in the mobile app
argument-hint: [operation-name]
disable-model-invocation: true
---

# Add Mutation

Create a mobile mutation wrapper for an `@ecency/sdk` mutation hook.

## Architecture

```
@ecency/sdk (platform-agnostic mutation hook)
    |
src/providers/sdk/mutations/use<Operation>Mutation.ts (mobile wrapper — adds auth context)
    |
Screen / Component (calls the mutation)
```

The SDK handles all broadcast logic (key signing, HiveSigner, HiveAuth fallback, auth upgrade).
The mobile wrapper just provides the current user and auth context via `useMutationAuth()`.

## Step 1: Create the Mutation Wrapper

Location: `src/providers/sdk/mutations/use<Operation>Mutation.ts`

Every wrapper follows this exact pattern:

```typescript
import { use<Operation> } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function use<Operation>Mutation() {
  const { username, authContext } = useMutationAuth();
  return use<Operation>(username, authContext);
}
```

`useMutationAuth()` (from `./common.ts`) provides:
- `username` — from Redux `selectCurrentAccount`
- `authContext` — `{ adapter: mobilePlatformAdapter, enableFallback: true }`

## Step 2: Export from Index

Add to `src/providers/sdk/mutations/index.ts`:

```typescript
export { use<Operation>Mutation } from './use<Operation>Mutation';
```

## Step 3: Use in a Screen/Component

```typescript
import { use<Operation>Mutation } from '../providers/sdk/mutations';

function MyScreen() {
  const mutation = use<Operation>Mutation();

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync({ /* operation params */ });
      // Success handling
    } catch (error) {
      // Error handling (auth upgrade, cancellation, etc.)
    }
  };
}
```

## How Auth Works Under the Hood

The `mobilePlatformAdapter` in `src/providers/sdk/mobilePlatformAdapter.ts` handles:

1. **Key-based users**: Decrypts posting/active key from AsyncStorage using PIN
2. **HiveSigner users**: Opens WebView for hot signing via `hive-uri` encoded operations
3. **HiveAuth users**: Triggers `HiveAuthBroadcastSheet` for keychain app signing
4. **Auth upgrade**: If active key is needed but user logged in with posting key, shows `AuthUpgradeSheet` to collect the key temporarily (60s expiry)

You do NOT need to handle any of this in the wrapper — the SDK + adapter handles it automatically.

## Step 4: If the SDK Mutation Doesn't Exist Yet

If the operation isn't in `@ecency/sdk` yet, create it there first:

Location: `packages/sdk/src/modules/<domain>/mutations/use-<operation>.ts`

```typescript
import { useBroadcastMutation, AuthorityLevel } from "@/modules/core/mutations/use-broadcast-mutation";
import { AuthContextV2 } from "@/modules/core/types/auth";

export function use<Operation>(username?: string, auth?: AuthContextV2) {
  return useBroadcastMutation(
    ["<operation-key>"],
    async (args: { /* params */ }) => {
      return [["<hive_operation_name>", { /* fields */ }]];
    },
    username,
    auth,
    {
      authorityLevel: AuthorityLevel.POSTING, // or ACTIVE
    }
  );
}
```

Then rebuild SDK: `cd ../vision-next && pnpm --filter @ecency/sdk build`

## Authority Levels

- **POSTING**: vote, comment, reblog, follow, community roles, account_update2 (profile)
- **ACTIVE**: transfer, delegate, power up/down, savings, limit orders, account_update (key changes)

## Common Gotchas

1. **Don't handle auth manually** — the adapter + SDK handle key decryption, HiveSigner, HiveAuth, and auth upgrade automatically
2. **Don't show toasts in the wrapper** — use the SDK's `onSuccess`/`onError` callbacks or handle in the calling component
3. **Re-export from index** — or the mutation won't be importable from `../providers/sdk/mutations`
4. **Check SDK version** — ensure the SDK hook you're wrapping exists in the installed `@ecency/sdk` version
