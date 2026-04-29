import { useUnsubscribeCommunity } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useUnsubscribeCommunityMutation() {
  const { username, authContext } = useMutationAuth();
  return useUnsubscribeCommunity(username, authContext, 'async');
}
