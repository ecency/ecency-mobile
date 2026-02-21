import { useDeleteComment } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useDeleteCommentMutation() {
  const { username, authContext } = useMutationAuth();
  return useDeleteComment(username, authContext);
}
