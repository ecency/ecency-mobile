import { useFollow } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useFollowMutation() {
  const { username, authContext } = useMutationAuth();
  return useFollow(username, authContext, 'async');
}
