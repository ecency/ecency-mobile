import { useLimitOrderCreate } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useLimitOrderCreateMutation() {
  const { username, authContext } = useMutationAuth();
  return useLimitOrderCreate(username, authContext);
}
