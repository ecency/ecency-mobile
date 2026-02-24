import { useUnfollow } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useUnfollowMutation() {
  const { username, authContext } = useMutationAuth();
  return useUnfollow(username, authContext);
}
