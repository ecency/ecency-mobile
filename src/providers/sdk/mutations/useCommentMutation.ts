import { useComment } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useCommentMutation() {
  const { username, authContext } = useMutationAuth();
  return useComment(username, authContext);
}
