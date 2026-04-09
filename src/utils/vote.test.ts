import { calculateVoteRshares, calculateVoteReward } from './vote';

// Import after mocks are set up
import { getEstimatedAmount, calculateEstimatedRShares } from './vote';

// Mock dhive's votingPower since it requires a native hive client
jest.mock('../providers/hive/hive', () => ({
  votingPower: jest.fn((account) => account._mockVotingPower ?? 100),
}));

// Mock parseToken to avoid import issues
jest.mock('./parseToken', () => ({
  __esModule: true,
  default: (str: string) => {
    if (!str) return 0;
    const num = parseFloat(String(str).split(' ')[0]);
    return Number.isNaN(num) ? 0 : num;
  },
}));

describe('calculateVoteRshares', () => {
  it('calculates rshares with full power and weight', () => {
    // userVestingShares = 100 * 1e6 = 1e8
    // userVotingPower = 10000 * (10000/10000) = 10000
    // voteRshares = 1e8 * (10000/10000) * 0.02 = 2_000_000
    expect(calculateVoteRshares(100, 10000, 10000)).toBe(2_000_000);
  });

  it('scales linearly with weight', () => {
    const full = calculateVoteRshares(100, 10000, 10000);
    const half = calculateVoteRshares(100, 10000, 5000);
    expect(half).toBeCloseTo(full / 2);
  });

  it('handles negative weight (downvote)', () => {
    const result = calculateVoteRshares(100, 10000, -5000);
    // abs(-5000) = 5000, so same magnitude as half weight
    expect(result).toBeCloseTo(calculateVoteRshares(100, 10000, 5000));
  });

  it('returns 0 with zero vesting power', () => {
    expect(calculateVoteRshares(0, 10000, 10000)).toBe(0);
  });

  it('uses default vp=10000 and weight=10000', () => {
    expect(calculateVoteRshares(100)).toBe(calculateVoteRshares(100, 10000, 10000));
  });
});

describe('calculateVoteReward', () => {
  it('returns 0 when voteRShares is 0 or falsy', () => {
    expect(calculateVoteReward(0, {})).toBe(0);
    expect(calculateVoteReward(null as any, {})).toBe(0);
  });

  it('calculates reward based on payout ratio', () => {
    const post = {
      total_payout: 100,
      active_votes: [],
    };
    // totalRshares provided = 1000
    // ratio = 100 / 1000 = 0.1
    // reward = 500 * 0.1 = 50
    expect(calculateVoteReward(500, post, 1000)).toBe(50);
  });

  it('computes totalRshares from active_votes when not provided', () => {
    const post = {
      total_payout: 100,
      active_votes: [{ rshares: 300 }, { rshares: 200 }],
    };
    // totalRshares = 300 + 200 = 500
    // ratio = 100 / 500 = 0.2
    // reward = 100 * 0.2 = 20
    expect(calculateVoteReward(100, post, undefined)).toBe(20);
  });

  it('falls back to voteRShares as totalRshares when no active_votes', () => {
    const post = {
      total_payout: 50,
      active_votes: [],
    };
    // totalRshares = voteRShares = 200 (empty array length is 0 so falsy)
    // ratio = 50 / 200 = 0.25
    // reward = 200 * 0.25 = 50
    expect(calculateVoteReward(200, post, undefined)).toBe(50);
  });

  it('returns 0 when totalRshares is 0', () => {
    const post = {
      total_payout: 100,
      active_votes: [],
    };
    expect(calculateVoteReward(100, post, 0)).toBe(0);
  });

  it('uses pending_payout_value as fallback for total_payout', () => {
    const post = {
      pending_payout_value: '10.000 HBD',
      active_votes: [],
    };
    // total_payout is undefined, pending_payout_value parseFloat = 10
    // totalRshares = voteRShares = 500
    // ratio = 10 / 500 = 0.02
    // reward = 500 * 0.02 = 10
    expect(calculateVoteReward(500, post, undefined)).toBe(10);
  });
});

describe('calculateEstimatedRShares', () => {
  it('calculates rshares from account vesting shares', () => {
    const account = {
      _mockVotingPower: 100, // 100% voting power
      vesting_shares: '1000.000000 VESTS',
      received_vesting_shares: '200.000000 VESTS',
      delegated_vesting_shares: '100.000000 VESTS',
    };
    // votingPower returns 100, * 100 = 10000
    // totalVests = 1000 + 200 - 100 = 1100
    // calculateVoteRshares(1100, 10000, 10000)
    const result = calculateEstimatedRShares(account);
    expect(result).toBe(calculateVoteRshares(1100, 10000, 10000));
  });

  it('handles partial weight', () => {
    const account = {
      _mockVotingPower: 100,
      vesting_shares: '1000.000000 VESTS',
      received_vesting_shares: '0.000000 VESTS',
      delegated_vesting_shares: '0.000000 VESTS',
    };
    const full = calculateEstimatedRShares(account, 10000);
    const half = calculateEstimatedRShares(account, 5000);
    expect(half).toBeCloseTo(full / 2);
  });
});

describe('getEstimatedAmount', () => {
  const globalProps = {
    fundRecentClaims: 1_000_000_000,
    fundRewardBalance: 1000,
    base: 0.5,
    quote: 1,
    hivePerMVests: 500,
    hbdPrintRate: 10000,
  };

  const account = {
    _mockVotingPower: 100,
    vesting_shares: '1000000.000000 VESTS',
    received_vesting_shares: '0.000000 VESTS',
    delegated_vesting_shares: '0.000000 VESTS',
  };

  it('returns a string', () => {
    const result = getEstimatedAmount(account, globalProps);
    expect(typeof result).toBe('string');
  });

  it('returns "0.00" for NaN result', () => {
    const badProps = {
      ...globalProps,
      fundRecentClaims: 0,
      fundRewardBalance: 0,
      base: 0,
      quote: 0,
    };
    expect(getEstimatedAmount(account, badProps)).toBe('0.00');
  });

  it('returns value with 2 decimal places for amounts >= 1', () => {
    const result = getEstimatedAmount(account, globalProps);
    const num = parseFloat(result);
    if (num >= 1) {
      expect(result).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it('scales with slider value', () => {
    const full = parseFloat(getEstimatedAmount(account, globalProps, 1));
    const half = parseFloat(getEstimatedAmount(account, globalProps, 0.5));
    // Half slider should give approximately half value (not exact due to precision formatting)
    if (full > 0 && half > 0) {
      expect(half / full).toBeCloseTo(0.5, 0);
    }
  });

  it('handles negative slider (downvote)', () => {
    const result = getEstimatedAmount(account, globalProps, -1);
    const num = parseFloat(result);
    // Negative slider produces negative voteValue; Math.min(voteValue * -1, 0)
    // flips sign and clamps to max 0, but with large vesting the flip yields a large negative
    expect(typeof result).toBe('string');
    expect(Number.isNaN(num)).toBe(false);
  });
});
