import { useComment, useUpdateReply, useDeleteComment } from '@ecency/sdk';
import { useAuthContext } from '../../sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';

export function useCommentMutations() {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const username = currentAccount?.name;

  const commentMutation = useComment(username, authContext);
  const updateReplyMutation = useUpdateReply(username, authContext);
  const deleteCommentMutation = useDeleteComment(username, authContext);

  return { commentMutation, updateReplyMutation, deleteCommentMutation };
}
