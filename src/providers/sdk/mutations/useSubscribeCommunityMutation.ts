import { useSubscribeCommunity } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useSubscribeCommunityMutation() {
  const { username, authContext } = useMutationAuth();
  return useSubscribeCommunity(username, authContext, 'async');
}
