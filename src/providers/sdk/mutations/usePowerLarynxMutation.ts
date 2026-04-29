import { usePowerLarynx } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function usePowerLarynxMutation() {
  const { username, authContext } = useMutationAuth();
  return usePowerLarynx(username, authContext, 'async');
}
