import { useClaimEngineRewards } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useClaimEngineRewardsMutation() {
  const { username, authContext } = useMutationAuth();
  return useClaimEngineRewards(username, authContext, 'async');
}
