# Mobile SDK Adapter — Quick Start

## Usage in Components

```typescript
import { useVote } from '@ecency/sdk';
import { useAuthContext } from '../../../providers/sdk';

function MyVoteComponent({ author, permlink }) {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const voteMutation = useVote(currentAccount?.name, authContext);

  const handleUpvote = () => {
    voteMutation.mutateAsync({
      author,
      permlink,
      weight: 10000, // 100% upvote
      estimated: 0.05, // optional estimated payout
    });
  };

  return <Button onPress={handleUpvote} disabled={voteMutation.isPending} />;
}
```

## What the Adapter Handles

- Getting user data from TanStack Query cache
- Decrypting keys with PIN from Redux store
- Selecting correct auth method (key, HiveSigner, HiveAuth)
- Showing HiveAuth broadcast sheet when needed
- Recording activity for Ecency points
- Invalidating query cache after mutations
- Showing toast notifications for errors/success

## Available SDK Mutations

```typescript
import { useVote, useComment, useFollow, useReblog, useDeleteComment } from '@ecency/sdk';

// All mutations follow the same pattern:
const authContext = useAuthContext();
const mutation = useVote(username, authContext);
mutation.mutateAsync({ ...payload });
```

## Files

| File | Purpose |
|---|---|
| `mobilePlatformAdapter.ts` | Factory function implementing SDK's PlatformAdapter |
| `useAuthContext.ts` | Hook returning AuthContextV2 for mutation hooks |
| `index.ts` | Barrel exports |
