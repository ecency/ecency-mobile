import {
  applyRecentVoteOverrideToEntry,
  applyVoteToPost,
  updateVoteInQueryCaches,
  VoteCacheEntry,
} from './voteCacheUtils';

// voteCacheUtils imports getQueryClient from the queries barrel at module load;
// stub it so this unit test doesn't pull in the heavy query/provider graph.
// setQueriesData is a no-op: updateVoteInQueryCaches is only used here to seed
// the module-level recent-votes map that applyRecentVoteOverrideToEntry reads.
jest.mock('../index', () => ({
  getQueryClient: jest.fn(() => ({ setQueriesData: jest.fn() })),
}));

const upvote: VoteCacheEntry = {
  amount: 0.012,
  isDownvote: false,
  rshares: 100,
  percent: 5000,
  incrementStep: 0,
  voter: 'dave',
  votedAt: 0,
  status: 'PUBLISHED',
};

describe('applyVoteToPost net_votes (custom waves feed)', () => {
  it('increments net_votes for a feed wave with no active_votes/stats', () => {
    const wave = {
      author: 'alice',
      permlink: 'wave-1',
      net_votes: 29,
      pending_payout_value: '0.000 HBD',
    };

    const result = applyVoteToPost(wave, upvote);

    // Count ticks up optimistically instead of staying pinned at 29.
    expect(result.net_votes).toBe(30);
    expect(result.active_votes).toHaveLength(1);
    expect(result.isUpVoted).toBe(true);
    // Payout string is bumped by the estimated amount as well.
    expect(result.pending_payout_value).toBe('0.012 HBD');
  });

  it('decrements net_votes on unvote when the voter is in active_votes', () => {
    const wave = {
      author: 'alice',
      permlink: 'wave-1',
      net_votes: 30,
      active_votes: [{ voter: 'dave', rshares: 100, percent: 5000, amount: 0.012 }],
      pending_payout_value: '0.012 HBD',
    };

    const result = applyVoteToPost(wave, {
      ...upvote,
      status: 'DELETED',
      rshares: 0,
      percent: 0,
      amount: 0,
    });

    expect(result.net_votes).toBe(29);
    expect(result.active_votes).toHaveLength(0);
  });

  it('decrements net_votes for a new downvote on a feed wave', () => {
    const wave = {
      author: 'alice',
      permlink: 'wave-1',
      net_votes: 29,
      pending_payout_value: '5.000 HBD',
    };

    const result = applyVoteToPost(wave, {
      ...upvote,
      isDownvote: true,
      rshares: -100,
      percent: -5000,
    });

    // net_votes is net (up - down), so a downvote moves the count down.
    expect(result.net_votes).toBe(28);
    expect(result.isDownVoted).toBe(true);
  });

  it('increments net_votes when removing a downvote', () => {
    const wave = {
      author: 'alice',
      permlink: 'wave-1',
      net_votes: 28,
      active_votes: [{ voter: 'dave', rshares: -100, percent: -5000, amount: 0 }],
    };

    const result = applyVoteToPost(wave, {
      ...upvote,
      status: 'DELETED',
      rshares: 0,
      percent: 0,
      amount: 0,
    });

    expect(result.net_votes).toBe(29);
    expect(result.active_votes).toHaveLength(0);
  });

  it('does not change net_votes when re-weighting an existing vote', () => {
    const wave = {
      author: 'alice',
      permlink: 'wave-1',
      net_votes: 30,
      active_votes: [{ voter: 'dave', rshares: 100, percent: 5000, amount: 0.01 }],
    };

    const result = applyVoteToPost(wave, { ...upvote, rshares: 200, percent: 10000, amount: 0.02 });

    expect(result.net_votes).toBe(30);
    expect(result.active_votes).toHaveLength(1);
  });

  it('leaves net_votes untouched when the post does not carry it', () => {
    const post = {
      author: 'alice',
      permlink: 'p',
      active_votes: [{ voter: 'bob', rshares: 50, percent: 5000, amount: 0.005 }],
      stats: { total_votes: 1 },
    };

    const result = applyVoteToPost(post, upvote);

    expect(result.net_votes).toBeUndefined();
    // The existing stats-based count path is unaffected.
    expect(result.stats.total_votes).toBe(2);
  });
});

describe('applyRecentVoteOverrideToEntry payout double-count guard', () => {
  const seedRecentVote = (permlink: string, amount: number) => {
    updateVoteInQueryCaches('alice', permlink, {
      ...upvote,
      amount,
      votedAt: Date.now(),
    });
  };

  it('skips re-applying when the entry already carries the vote without an amount marker', () => {
    seedRecentVote('post-indexed', 2);

    // Post-broadcast shape: SDK cache write / server-indexed data both hold the
    // voter's record as bare { rshares, voter } and a payout that already
    // includes the vote. Re-adding the amount here is the 3 -> 5 payout flash.
    const entry = {
      author: 'alice',
      permlink: 'post-indexed',
      total_payout: 3,
      pending_payout_value: '3.000 HBD',
      active_votes: [{ voter: 'dave', rshares: 987654321 }],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    expect(result).toBe(entry);
    expect(result.pending_payout_value).toBe('3.000 HBD');
    expect(result.total_payout).toBe(3);
  });

  it('re-applies the vote when refetched data does not include it yet', () => {
    seedRecentVote('post-lagging', 2);

    // Chain/indexer lag: refetch returned pre-vote data, so the override must
    // still add the vote back.
    const entry = {
      author: 'alice',
      permlink: 'post-lagging',
      total_payout: 1,
      pending_payout_value: '1.000 HBD',
      active_votes: [],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    expect(result.pending_payout_value).toBe('3.000 HBD');
    expect(result.total_payout).toBe(3);
    expect(result.isUpVoted).toBe(true);
  });

  it('stays idempotent over our own optimistic record (amount marker present)', () => {
    seedRecentVote('post-optimistic', 2);

    const entry = {
      author: 'alice',
      permlink: 'post-optimistic',
      total_payout: 3,
      pending_payout_value: '3.000 HBD',
      active_votes: [{ voter: 'dave', rshares: 100, percent: 5000, amount: 2 }],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    // Same amount in the record and the recent vote -> zero payout delta.
    expect(result.pending_payout_value).toBe('3.000 HBD');
    expect(result.total_payout).toBe(3);
  });

  it('skips re-applying a recent downvote when the entry already carries the bare record', () => {
    updateVoteInQueryCaches('alice', 'post-indexed-down', {
      ...upvote,
      isDownvote: true,
      rshares: -100,
      percent: -5000,
      amount: 2,
      votedAt: Date.now(),
    });

    const entry = {
      author: 'alice',
      permlink: 'post-indexed-down',
      pending_payout_value: '0.000 HBD',
      active_votes: [{ voter: 'dave', rshares: -987654321 }],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    expect(result).toBe(entry);
    expect(result.pending_payout_value).toBe('0.000 HBD');
  });

  it('treats an amount of 0 as a present marker and still applies the vote delta', () => {
    seedRecentVote('post-zero-amount', 2);

    // amount: 0 is a real numeric marker (tiny estimates and removal records
    // carry it) — the guard must not confuse it with a missing amount.
    const entry = {
      author: 'alice',
      permlink: 'post-zero-amount',
      pending_payout_value: '1.000 HBD',
      active_votes: [{ voter: 'dave', rshares: 100, percent: 5000, amount: 0 }],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    expect(result.pending_payout_value).toBe('3.000 HBD');
  });

  it('does not re-apply once the recent vote is older than the TTL', () => {
    updateVoteInQueryCaches('alice', 'post-expired', {
      ...upvote,
      amount: 2,
      votedAt: Date.now() - 16 * 1000,
    });

    const entry = {
      author: 'alice',
      permlink: 'post-expired',
      pending_payout_value: '1.000 HBD',
      active_votes: [],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    expect(result).toBe(entry);
    expect(result.pending_payout_value).toBe('1.000 HBD');
  });

  it('still removes the vote for a recent unvote even without an amount marker', () => {
    updateVoteInQueryCaches('alice', 'post-unvoted', {
      ...upvote,
      amount: 0,
      rshares: 0,
      percent: 0,
      status: 'DELETED',
      votedAt: Date.now(),
    });

    const entry = {
      author: 'alice',
      permlink: 'post-unvoted',
      pending_payout_value: '3.000 HBD',
      active_votes: [{ voter: 'dave', rshares: 987654321 }],
    };

    const result = applyRecentVoteOverrideToEntry(entry);

    expect(result.active_votes).toHaveLength(0);
    expect(result.isUpVoted).toBe(false);
  });
});
