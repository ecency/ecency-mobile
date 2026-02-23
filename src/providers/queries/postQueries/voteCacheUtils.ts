import { InfiniteData } from '@tanstack/react-query';
import { getQueryClient } from '../index';

export interface VoteCacheEntry {
  amount: number;
  isDownvote: boolean;
  rshares: number;
  percent: number;
  incrementStep: number;
  voter: string;
  votedAt: number;
  expiresAt: number;
  status: 'PENDING' | 'PUBLISHED' | 'DELETED' | 'FAILED';
}

// Query key second segments under ['posts', ...] that contain voteable data
// SDK uses hyphenated keys: 'posts-ranked-page', 'account-posts-page', etc.
const VOTE_QUERY_TYPES = [
  'entry',
  'posts-ranked-page',
  'account-posts-page',
  'discussions',
  'promoted',
  'waves',
];

/**
 * Updates vote data directly in TanStack Query caches across all relevant queries.
 * Replaces the Redux votesCollection + useInjectVotesCache pattern.
 *
 * Updates active_votes array and derived fields (isUpVoted, isDownVoted, payout)
 * so that both raw and parsed post data reflects the vote change immediately.
 */
export function updateVoteInQueryCaches(author: string, permlink: string, vote: VoteCacheEntry) {
  if (vote.status === 'FAILED') {
    return;
  }

  const queryClient = getQueryClient();
  const postPath = `${author}/${permlink}`;

  queryClient.setQueriesData(
    {
      predicate: (query) => {
        const key = query.queryKey;
        // SDK post queries: ['posts', 'entry'|'posts-ranked-page'|'account-posts-page'|'waves'|...]
        if (key[0] === 'posts' && VOTE_QUERY_TYPES.includes(key[1] as string)) {
          return true;
        }
        return false;
      },
    },
    (oldData: any) => {
      if (!oldData) {
        return oldData;
      }
      return updateDataWithVote(oldData, postPath, vote);
    },
  );
}

function updateDataWithVote(data: any, postPath: string, vote: VoteCacheEntry): any {
  // InfiniteData: { pages: Page[], pageParams: any[] }
  if (data?.pages && Array.isArray(data.pages)) {
    return updateInfiniteData(data as InfiniteData<any[]>, postPath, vote);
  }

  // Single entry object
  if (data?.author && data?.permlink) {
    if (`${data.author}/${data.permlink}` !== postPath) {
      return data;
    }
    return applyVoteToPost(data, vote);
  }

  // Array of entries (discussions, promoted, waves)
  if (Array.isArray(data)) {
    return updatePostArray(data, postPath, vote);
  }

  return data;
}

function updateInfiniteData(
  data: InfiniteData<any[]>,
  postPath: string,
  vote: VoteCacheEntry,
): InfiniteData<any[]> {
  let hasChanges = false;

  const newPages = data.pages.map((page) => {
    if (!Array.isArray(page)) {
      return page;
    }

    let pageChanged = false;
    const newPage = page.map((post) => {
      if (!post || `${post.author}/${post.permlink}` !== postPath) {
        return post;
      }
      pageChanged = true;
      return applyVoteToPost(post, vote);
    });

    if (pageChanged) {
      hasChanges = true;
    }
    return pageChanged ? newPage : page;
  });

  return hasChanges ? { ...data, pages: newPages } : data;
}

function updatePostArray(data: any[], postPath: string, vote: VoteCacheEntry): any[] {
  let changed = false;
  const result = data.map((item) => {
    if (!item || `${item.author}/${item.permlink}` !== postPath) {
      return item;
    }
    changed = true;
    return applyVoteToPost(item, vote);
  });
  return changed ? result : data;
}

/**
 * Applies vote data to a post/comment object.
 * Works with both raw API data and parsed post data.
 */
function applyVoteToPost(post: any, vote: VoteCacheEntry): any {
  const activeVotes = Array.isArray(post.active_votes) ? post.active_votes : [];
  const voteIdx = activeVotes.findIndex((v: any) => v.voter === vote.voter);

  // DELETED: remove existing vote
  if (vote.status === 'DELETED') {
    if (voteIdx < 0) {
      return post;
    }
    const cloned = { ...post };
    cloned.active_votes = activeVotes.filter((_: any, i: number) => i !== voteIdx);
    cloned.isUpVoted = false;
    cloned.isDownVoted = false;
    // Subtract the removed vote's payout contribution
    const removedAmount = (vote.amount || 0) * (vote.isDownvote ? -1 : 1);
    adjustPayout(cloned, post, -removedAmount);
    if (post.stats) {
      cloned.stats = { ...post.stats, total_votes: cloned.active_votes.length };
    }
    return cloned;
  }

  // New vote (voter not yet in active_votes)
  if (voteIdx < 0) {
    const cloned = { ...post };
    cloned.active_votes = [
      ...activeVotes,
      { voter: vote.voter, rshares: vote.rshares, percent: vote.percent, amount: vote.amount },
    ];
    // Adjust payout for new votes (accurate since no old contribution to subtract)
    const voteAmount = (vote.amount || 0) * (vote.isDownvote ? -1 : 1);
    adjustPayout(cloned, post, voteAmount);
    cloned.isUpVoted = !vote.isDownvote;
    cloned.isDownVoted = !!vote.isDownvote;
    if (post.stats) {
      cloned.stats = { ...post.stats, total_votes: cloned.active_votes.length };
    }
    return cloned;
  }

  // Vote update (voter already exists — changing weight)
  const cloned = { ...post };
  const updatedVotes = [...activeVotes];
  const oldAmount = activeVotes[voteIdx].amount || 0;
  updatedVotes[voteIdx] = {
    ...activeVotes[voteIdx],
    rshares: vote.rshares,
    percent: vote.percent,
    amount: vote.amount,
  };
  cloned.active_votes = updatedVotes;
  // Adjust payout by delta between new and old vote amounts
  const oldSigned = oldAmount * (vote.isDownvote ? -1 : 1);
  const newSigned = (vote.amount || 0) * (vote.isDownvote ? -1 : 1);
  adjustPayout(cloned, post, newSigned - oldSigned);
  cloned.isUpVoted = !vote.isDownvote;
  cloned.isDownVoted = !!vote.isDownvote;
  if (post.stats) {
    cloned.stats = { ...post.stats };
  }
  return cloned;
}

/**
 * Adjusts payout values on the cloned post.
 * Handles both raw format (pending_payout_value string like "1.234 HBD")
 * and parsed format (total_payout number).
 */
function adjustPayout(cloned: any, original: any, delta: number): void {
  if (typeof original.total_payout === 'number') {
    cloned.total_payout = Math.max(0, original.total_payout + delta);
  }
  if (typeof original.pending_payout_value === 'string') {
    const parts = original.pending_payout_value.split(' ');
    if (parts.length >= 2) {
      const amount = parseFloat(parts[0]) || 0;
      cloned.pending_payout_value = `${Math.max(0, amount + delta).toFixed(3)} ${parts[1]}`;
    }
  }
}
