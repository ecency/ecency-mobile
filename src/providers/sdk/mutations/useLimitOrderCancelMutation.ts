import { useLimitOrderCancel } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useLimitOrderCancelMutation() {
  const { username, authContext } = useMutationAuth();
  return useLimitOrderCancel(username, authContext);
}
