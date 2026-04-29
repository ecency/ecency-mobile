import { useUpdateReply } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useUpdateReplyMutation() {
  const { username, authContext } = useMutationAuth();
  return useUpdateReply(username, authContext, 'async');
}
