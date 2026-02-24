import { useAccountUpdate } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useAccountUpdateMutation() {
  const { username, authContext } = useMutationAuth();
  return useAccountUpdate(username, authContext);
}
