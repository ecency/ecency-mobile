import {
  useComment,
  useUpdateReply,
  useDeleteComment,
  addOptimisticDiscussionEntry,
  removeOptimisticDiscussionEntry,
  getPostQueryOptions,
  type Entry,
} from '@ecency/sdk';
import { useAuthContext } from '../../sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import { getQueryClient } from '../index';

type CommentJsonMetadata = Record<string, unknown>;

/**
 * Updates a parent comment's `replies` array in all discussions caches for the given root post.
 * The tree builder in restructureData() traverses via `replies` arrays, so an optimistic entry
 * won't be visible unless it's referenced in its parent's `replies`.
 */
const updateParentRepliesInDiscussions = (
  queryClient: ReturnType<typeof getQueryClient>,
  rootAuthor: string,
  rootPermlink: string,
  parentAuthor: string,
  parentPermlink: string,
  childKey: string,
  action: 'add' | 'remove',
) => {
  const queries = queryClient.getQueriesData<any[]>({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        Array.isArray(key) &&
        key[0] === 'posts' &&
        key[1] === 'discussions' &&
        key[2] === rootAuthor &&
        key[3] === rootPermlink
      );
    },
  });

  const parentKey = `${parentAuthor}/${parentPermlink}`;

  queries.forEach(([queryKey, data]) => {
    if (!Array.isArray(data)) return;

    let changed = false;
    const updatedData = data.map((entry) => {
      const entryKey =
        entry?.author && entry?.permlink ? `${entry.author}/${entry.permlink}` : null;
      if (entryKey !== parentKey) return entry;

      const currentReplies: any[] = entry.replies || [];

      if (action === 'add') {
        // Replies may be strings ("author/permlink") or objects — normalize check
        const alreadyExists = currentReplies.some((r) => {
          if (typeof r === 'string') return r === childKey;
          if (r?.author && r?.permlink) return `${r.author}/${r.permlink}` === childKey;
          return false;
        });
        if (!alreadyExists) {
          changed = true;
          return { ...entry, replies: [...currentReplies, childKey] };
        }
      } else {
        const filtered = currentReplies.filter((r) => {
          if (typeof r === 'string') return r !== childKey;
          if (r?.author && r?.permlink) return `${r.author}/${r.permlink}` !== childKey;
          return true;
        });
        if (filtered.length !== currentReplies.length) {
          changed = true;
          return { ...entry, replies: filtered };
        }
      }
      return entry;
    });

    if (changed) {
      queryClient.setQueryData(queryKey, updatedData);
    }
  });
};

const updateEntryChildrenCount = (
  queryClient: ReturnType<typeof getQueryClient>,
  author: string,
  permlink: string,
  delta: 1 | -1,
) => {
  const key = getPostQueryOptions(author, permlink).queryKey;
  const entry = queryClient.getQueryData<Entry>(key);
  if (!entry) {
    return;
  }

  const nextChildren = Math.max(0, (entry.children ?? 0) + delta);
  queryClient.setQueryData(key, {
    ...entry,
    children: nextChildren,
  });
};

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
  jsonMetadata: CommentJsonMetadata;
  authorReputation?: number;
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
    author_reputation: params.authorReputation ?? 25,
    replies: [],
    is_optimistic: true,
    renderOnTop: true,
  };

  addOptimisticDiscussionEntry(
    optimisticEntry,
    params.rootAuthor,
    params.rootPermlink,
    queryClient,
  );

  // Update parent's replies array so the tree builder can find the optimistic entry.
  // The SDK adds the entry to the flat array, but restructureData() traverses via
  // each comment's `replies` — without this, nested optimistic replies are invisible.
  const optimisticKey = `${params.author}/${params.permlink}`;
  updateParentRepliesInDiscussions(
    queryClient,
    params.rootAuthor,
    params.rootPermlink,
    params.parentAuthor,
    params.parentPermlink,
    optimisticKey,
    'add',
  );

  // Also inject into thread view caches (e.g., when a comment is opened as its own thread).
  // Thread views use a discussion cache keyed by commentAuthor/commentPermlink, which is
  // different from the root post cache above. We scan all discussion caches and inject into
  // any that contain the parent comment.
  if (params.parentAuthor !== params.rootAuthor || params.parentPermlink !== params.rootPermlink) {
    const allQueries = queryClient.getQueriesData<any[]>({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === 'posts' &&
          key[1] === 'discussions' &&
          // Skip root post cache (already handled above)
          !(key[2] === params.rootAuthor && key[3] === params.rootPermlink)
        );
      },
    });

    allQueries.forEach(([queryKey, data]) => {
      if (!Array.isArray(data)) return;
      const hasParent = data.some(
        (e) => e?.author === params.parentAuthor && e?.permlink === params.parentPermlink,
      );
      if (!hasParent) return;

      queryClient.setQueryData(queryKey, [optimisticEntry, ...data]);
      const threadRootAuthor = queryKey[2] as string;
      const threadRootPermlink = queryKey[3] as string;
      updateParentRepliesInDiscussions(
        queryClient,
        threadRootAuthor,
        threadRootPermlink,
        params.parentAuthor,
        params.parentPermlink,
        optimisticKey,
        'add',
      );
    });
  }

  // Increment root post children count
  updateEntryChildrenCount(queryClient, params.rootAuthor, params.rootPermlink, 1);

  // Also increment the direct parent comment count when replying to a nested comment
  if (params.parentAuthor !== params.rootAuthor || params.parentPermlink !== params.rootPermlink) {
    updateEntryChildrenCount(queryClient, params.parentAuthor, params.parentPermlink, 1);
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
  parentAuthor: string,
  parentPermlink: string,
) {
  const queryClient = getQueryClient();
  removeOptimisticDiscussionEntry(author, permlink, rootAuthor, rootPermlink, queryClient);

  // Remove from parent's replies array (reverse of addOptimisticComment)
  const optimisticKey = `${author}/${permlink}`;
  updateParentRepliesInDiscussions(
    queryClient,
    rootAuthor,
    rootPermlink,
    parentAuthor,
    parentPermlink,
    optimisticKey,
    'remove',
  );

  // Also remove from thread view caches (mirrors addOptimisticComment logic)
  if (parentAuthor !== rootAuthor || parentPermlink !== rootPermlink) {
    const allQueries = queryClient.getQueriesData<any[]>({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === 'posts' &&
          key[1] === 'discussions' &&
          !(key[2] === rootAuthor && key[3] === rootPermlink)
        );
      },
    });

    allQueries.forEach(([queryKey, data]) => {
      if (!Array.isArray(data)) return;
      const hasEntry = data.some((e) => e?.author === author && e?.permlink === permlink);
      if (!hasEntry) return;

      queryClient.setQueryData(
        queryKey,
        data.filter((e) => e.author !== author || e.permlink !== permlink),
      );
      const threadRootAuthor = queryKey[2] as string;
      const threadRootPermlink = queryKey[3] as string;
      updateParentRepliesInDiscussions(
        queryClient,
        threadRootAuthor,
        threadRootPermlink,
        parentAuthor,
        parentPermlink,
        `${author}/${permlink}`,
        'remove',
      );
    });
  }

  // Decrement root post children count
  updateEntryChildrenCount(queryClient, rootAuthor, rootPermlink, -1);

  // Also decrement the direct parent comment count for nested replies
  if (
    parentAuthor &&
    parentPermlink &&
    (parentAuthor !== rootAuthor || parentPermlink !== rootPermlink)
  ) {
    updateEntryChildrenCount(queryClient, parentAuthor, parentPermlink, -1);
  }
}
