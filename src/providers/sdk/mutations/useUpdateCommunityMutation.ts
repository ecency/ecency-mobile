import { useUpdateCommunity } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useUpdateCommunityMutation() {
  const { username, authContext } = useMutationAuth();
  return useUpdateCommunity(username, authContext);
}
