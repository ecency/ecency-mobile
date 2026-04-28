import { calculateVoteReward, getEstimatedAmount, calculateEstimatedRShares } from './vote';

jest.mock('@ecency/sdk', () => ({
  votingPower: jest.fn(() => 100),
  votingValue: jest.fn((_account, _props, _votingPowerValue, weight) => weight / 10000),
  votingRshares: jest.fn((_account, _props, _votingPowerValue, weight) => weight * 100),
}));

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
    expect(calculateVoteReward(500, post, 1000)).toBe(50);
  });

  it('computes totalRshares from active_votes when not provided', () => {
    const post = {
      total_payout: 100,
      active_votes: [{ rshares: 300 }, { rshares: 200 }],
    };
    expect(calculateVoteReward(100, post, undefined)).toBe(20);
  });
});

describe('calculateEstimatedRShares', () => {
  const globalProps = {
    fundRecentClaims: 1_000_000_000,
    fundRewardBalance: 1000,
    base: 0.5,
    quote: 1,
    hivePerMVests: 500,
    hbdPrintRate: 10000,
    votePowerReserveRate: 10,
    authorRewardCurve: 'linear',
    contentConstant: 2000000000000,
    currentHardforkVersion: '1.28.0',
    lastHardfork: 28,
  };

  const account = {
    vesting_shares: '1000.000000 VESTS',
    received_vesting_shares: '200.000000 VESTS',
    delegated_vesting_shares: '100.000000 VESTS',
  };

  it('delegates rshare estimation to the SDK helper', () => {
    expect(calculateEstimatedRShares(account, globalProps as any, 5000)).toBe(500000);
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
    votePowerReserveRate: 10,
    authorRewardCurve: 'linear',
    contentConstant: 2000000000000,
    currentHardforkVersion: '1.28.0',
    lastHardfork: 28,
  };

  const account = {
    vesting_shares: '1000000.000000 VESTS',
    received_vesting_shares: '0.000000 VESTS',
    delegated_vesting_shares: '0.000000 VESTS',
  };

  it('returns a string', () => {
    expect(typeof getEstimatedAmount(account, globalProps as any)).toBe('string');
  });

  it('uses SDK vote value math for positive slider values', () => {
    expect(getEstimatedAmount(account, globalProps as any, 1)).toBe('1.00');
    expect(getEstimatedAmount(account, globalProps as any, 0.5)).toBe('0.50');
  });

  it('returns a negative estimate for downvotes', () => {
    expect(getEstimatedAmount(account, globalProps as any, -1)).toBe('-1');
  });
});
