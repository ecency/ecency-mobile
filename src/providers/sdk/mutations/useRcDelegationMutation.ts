import { useRcDelegation } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useRcDelegationMutation() {
  const { username, authContext } = useMutationAuth();
  return useRcDelegation(username, authContext, 'async');
}
