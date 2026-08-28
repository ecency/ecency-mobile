---
name: add-mutation
description: Use when adding, wrapping, or calling an @ecency/sdk mutation hook in the mobile app (Hive broadcasts like transfer, follow, vote, delegate, community, engine token, or points)
argument-hint: [operation-name]
---

# Add Mutation

Wrap an `@ecency/sdk` mutation hook in `src/providers/sdk/mutations/`. CLAUDE.md
("SDK Migration") covers the adapter; this file is only the procedure.

## 1. Create the wrapper

`src/providers/sdk/mutations/use<Operation>Mutation.ts`. 40 of the 47 wrappers there are
exactly this shape, so copy it verbatim:

```typescript
import { useTransfer } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransfer(username, authContext, 'async');
}
```

- `'async'` is the broadcast mode: the last positional arg after `authContext`, so the
  third arg in 40 wrappers but the fourth in the two community ones. Pass it unless the
  hook has no such parameter. `useBroadcastMutation` takes it as
  `{ broadcastMode: 'async' }` inside the options object instead.
- `useMutationAuth()` from `./common.ts` (44 of 47 import it) returns
  `{ username, authContext }`: `currentAccount?.name` off `selectCurrentAccount`, plus
  `useAuthContext()` (`src/providers/sdk/useAuthContext.ts`) building
  `{ adapter: createMobilePlatformAdapter({...}), enableFallback: true }`. There is no
  `mobilePlatformAdapter` object, only the factory.
- Wrappers take no arguments. Three differ. `useSetCommunityRoleMutation(community)` plus
  `useUpdateCommunityMutation(community)` take the community because the SDK bakes it into
  the mutation key. `useAccountRelationsUpdateMutation(target, onSuccess, onError)` takes
  three because the SDK bakes the target plus both callbacks into the mutation options.
- Three of the 47 files are not broadcasts, so they skip `useMutationAuth`.
  `useGenerateImageMutation` plus the three digest hooks in
  `useNewsletterDigestMutations.ts` (`useSubscribeDigestMutation`,
  `useLeaveDigestMutation`, `useUnsubscribeAllDigestsMutation`) bind the HiveSigner `code`
  from `useAuth()` (`src/hooks/useAuth.ts`): `useGenerateImage(username, code)`.
  `useClaimPointsMutation` instead derives the access token itself, decrypting
  `currentAccount.local.accessToken` with `getDigitPinCode(pin)` plus `decryptKey`.

## 2. Export from the barrel

One line in `src/providers/sdk/mutations/index.ts`, under the matching domain comment.
Without it the hook is not importable:

```typescript
export { useTransferMutation } from './useTransferMutation';
```

## 3. Call it (from the barrel, never the file)

```typescript
import { useFollowMutation } from '../providers/sdk/mutations';
const followMutation = useFollowMutation();
await followMutation.mutateAsync({ following: data.following });
```

## No SDK hook for the operation?

There is no `packages/sdk` here. `@ecency/sdk` is an npm dependency (`^2.3.93`), so there
is no local build step. Use the generic `useBroadcastMutation`, as
`useIgnoreUserMutation.ts` does. Seven positional args:

```typescript
return useBroadcastMutation(
  ['hive', 'ignore-user'],                     // 1 mutation key
  username,                                    // 2 username
  ({ following }: { following: string }) => [  // 3 ops builder
    buildIgnoreOp(username!, following),
  ],
  undefined,                                   // 4 onSuccess or undefined
  authContext,                                 // 5 auth context
  'posting',                                   // 6 authority
  { broadcastMode: 'async' },                  // 7 options
);
```

Pass authority as a plain lowercase string. The parameter is typed `AuthorityLevel` from
`@ecency/sdk` (`'posting' | 'active' | 'owner' | 'memo'`); mobile wrappers only ever use
`'posting'` or `'active'`. Do not import the same-named type from
`src/screens/dappBrowser/bridges/bridgeTypes.ts`, an unrelated dapp browser union.

- `'posting'`: vote, comment, reblog, follow, ignore, community roles
- `'active'`: transfer, delegate, power up/down, savings, limit orders, proposal vote,
  witness proxy, account_update, account_update2

The SDK's exported `OPERATION_AUTHORITY_MAP` is the reference list. It maps both
`account_update` plus `account_update2` to `active`. `useBroadcastMutation` never consults
that map: its `authority` parameter just defaults to `'posting'`, so always pass the right
value explicitly.

Prefer an SDK `build<Operation>Op` helper (`buildTransferOp`, `buildVoteOp`) over a hand
written op tuple.

## Gotchas

1. Auth is not your job: the adapter routes PIN key decryption, HiveSigner `hive-uri`
   WebView signing, HiveAuth signing, plus the active key upgrade sheet (60s temp key).
2. No toasts or navigation in the wrapper. Do that at the call site or in hook callbacks.
3. Check the hook exists in the installed `@ecency/sdk` first, then run `yarn lint` plus
   `yarn typecheck`; the baseline is empty, so any error fails CI.
