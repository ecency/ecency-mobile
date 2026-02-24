import { useClaimInterest } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useClaimInterestMutation() {
  const { username, authContext } = useMutationAuth();
  return useClaimInterest(username, authContext);
}
