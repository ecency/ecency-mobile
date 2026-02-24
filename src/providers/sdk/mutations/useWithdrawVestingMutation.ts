import { useWithdrawVesting } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useWithdrawVestingMutation() {
  const { username, authContext } = useMutationAuth();
  return useWithdrawVesting(username, authContext);
}
