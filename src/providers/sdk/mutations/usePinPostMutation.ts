import { usePinPost } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function usePinPostMutation() {
  const { username, authContext } = useMutationAuth();
  return usePinPost(username, authContext);
}
