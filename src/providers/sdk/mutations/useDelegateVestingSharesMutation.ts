import { useDelegateVestingShares } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useDelegateVestingSharesMutation() {
  const { username, authContext } = useMutationAuth();
  return useDelegateVestingShares(username, authContext);
}
