import { useLockLarynx } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useLockLarynxMutation() {
  const { username, authContext } = useMutationAuth();
  return useLockLarynx(username, authContext, 'async');
}
