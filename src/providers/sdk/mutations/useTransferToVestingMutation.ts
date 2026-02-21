import { useTransferToVesting } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferToVestingMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferToVesting(username, authContext);
}
