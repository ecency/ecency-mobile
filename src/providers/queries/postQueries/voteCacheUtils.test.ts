import { applyVoteToPost, VoteCacheEntry } from './voteCacheUtils';

// voteCacheUtils imports getQueryClient from the queries barrel at module load;
// stub it so this unit test doesn't pull in the heavy query/provider graph.
jest.mock('../index', () => ({ getQueryClient: jest.fn() }));

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
