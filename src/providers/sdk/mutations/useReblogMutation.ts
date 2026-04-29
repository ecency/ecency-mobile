import { useReblog } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useReblogMutation() {
  const { username, authContext } = useMutationAuth();
  return useReblog(username, authContext, 'async');
}
