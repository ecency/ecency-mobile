import { useSetWithdrawVestingRoute } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useSetWithdrawVestingRouteMutation() {
  const { username, authContext } = useMutationAuth();
  return useSetWithdrawVestingRoute(username, authContext);
}
