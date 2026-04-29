import { useClaimRewards } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useClaimRewardsMutation() {
  const { username, authContext } = useMutationAuth();
  return useClaimRewards(username, authContext, 'async');
}
