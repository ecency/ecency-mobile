import { useCrossPost } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useCrossPostMutation() {
  const { username, authContext } = useMutationAuth();
  return useCrossPost(username, authContext, 'async');
}
