import { useSetCommunityRole } from '@ecency/sdk';
import { useMutationAuth } from './common';

/**
 * Unlike the other wrappers here this one takes an argument. The SDK signature is
 * `(community, username, auth, broadcastMode)` and it bakes `community` into the
 * mutation key, so it cannot be moved into the payload.
 */
export function useSetCommunityRoleMutation(community: string) {
  const { username, authContext } = useMutationAuth();
  return useSetCommunityRole(community, username, authContext, 'async');
}
