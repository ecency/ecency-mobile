import { useSetCommunityRole } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useSetCommunityRoleMutation() {
  const { username, authContext } = useMutationAuth();
  return useSetCommunityRole(username, authContext);
}
