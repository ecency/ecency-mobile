import {
  useComment,
  useUpdateReply,
  useDeleteComment,
  addOptimisticDiscussionEntry,
  removeOptimisticDiscussionEntry,
} from '@ecency/sdk';
import { useAuthContext } from '../../sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import { getQueryClient } from '../index';

export function useCommentMutations() {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const username = currentAccount?.name;

  const commentMutation = useComment(username, authContext);
  const updateReplyMutation = useUpdateReply(username, authContext);
  const deleteCommentMutation = useDeleteComment(username, authContext);

  return { commentMutation, updateReplyMutation, deleteCommentMutation };
}

/**
 * Adds an optimistic comment entry to the discussions query cache.
 * The entry appears immediately in the comments list and survives background
 * refetches via SDK's structuralSharing (is_optimistic flag). When the real
 * comment arrives from the API, the optimistic entry is automatically replaced.
 */
export function addOptimisticComment(params: {
  author: string;
  permlink: string;
  parentAuthor: string;
  parentPermlink: string;
  rootAuthor: string;
  rootPermlink: string;
  body: string;
  jsonMetadata: any;
}) {
  const queryClient = getQueryClient();
  const now = new Date().toISOString();

  const optimisticEntry = {
    author: params.author,
    permlink: params.permlink,
    parent_author: params.parentAuthor,
    parent_permlink: params.parentPermlink,
    root_author: params.rootAuthor,
    root_permlink: params.rootPermlink,
    body: params.body,
    json_metadata: params.jsonMetadata,
    created: now,
    updated: now,
    active_votes: [],
    children: 0,
    net_rshares: 0,
    pending_payout_value: '0.000 HBD',
    author_payout_value: '0.000 HBD',
    curator_payout_value: '0.000 HBD',
    max_accepted_payout: '1000000.000 HBD',
    author_reputation: 25,
    replies: [],
    is_optimistic: true,
  };

  addOptimisticDiscussionEntry(
    optimisticEntry,
    params.rootAuthor,
    params.rootPermlink,
    queryClient,
  );

  // Increment children count on the parent post entry cache
  const parentPath = `/@${params.rootAuthor}/${params.rootPermlink}`;
  const parentKey = ['posts', 'entry', parentPath];
  const parentPost = queryClient.getQueryData<any>(parentKey);
  if (parentPost) {
    queryClient.setQueryData(parentKey, {
      ...parentPost,
      children: (parentPost.children ?? 0) + 1,
    });
  }
}

/**
 * Removes an optimistic comment from the discussions query cache.
 * Used to roll back when comment submission fails.
 */
export function removeOptimisticComment(
  author: string,
  permlink: string,
  rootAuthor: string,
  rootPermlink: string,
) {
  const queryClient = getQueryClient();
  removeOptimisticDiscussionEntry(author, permlink, rootAuthor, rootPermlink, queryClient);

  // Decrement children count on the parent post entry cache
  const parentPath = `/@${rootAuthor}/${rootPermlink}`;
  const parentKey = ['posts', 'entry', parentPath];
  const parentPost = queryClient.getQueryData<any>(parentKey);
  if (parentPost && (parentPost.children ?? 0) > 0) {
    queryClient.setQueryData(parentKey, {
      ...parentPost,
      children: parentPost.children - 1,
    });
  }
}
