import { vestsToHp, hpToVests, vestsToRshares, rcFormatter } from './conversions';

describe('vestsToHp', () => {
  it('converts vests to HP using hivePerMVests rate', () => {
    expect(vestsToHp(1_000_000, 500)).toBe(500);
  });

  it('returns 0 when vests is 0', () => {
    expect(vestsToHp(0, 500)).toBe(0);
  });

  it('returns 0 when hivePerMVests is 0', () => {
    expect(vestsToHp(1000, 0)).toBe(0);
  });

  it('returns 0 when vests is null/undefined', () => {
    expect(vestsToHp(null, 500)).toBe(0);
    expect(vestsToHp(undefined, 500)).toBe(0);
  });

  it('returns 0 when hivePerMVests is null/undefined', () => {
    expect(vestsToHp(1000, null)).toBe(0);
    expect(vestsToHp(1000, undefined)).toBe(0);
  });

  it('handles string vests via parseFloat', () => {
    expect(vestsToHp('2000000' as any, 500)).toBe(1000);
  });

  it('handles small vests values', () => {
    const result = vestsToHp(100, 500);
    expect(result).toBeCloseTo(0.05);
  });
});

describe('hpToVests', () => {
  it('converts HP to vests', () => {
    expect(hpToVests(500, 500)).toBe(1_000_000);
  });

  it('returns 0 when hp is 0', () => {
    expect(hpToVests(0, 500)).toBe(0);
  });

  it('returns 0 when hivePerMVests is 0', () => {
    expect(hpToVests(100, 0)).toBe(0);
  });

  it('returns 0 for null/undefined inputs', () => {
    expect(hpToVests(null, 500)).toBe(0);
    expect(hpToVests(100, null)).toBe(0);
  });

  it('roundtrips with vestsToHp', () => {
    const hivePerMVests = 500;
    const originalVests = 123456;
    const hp = vestsToHp(originalVests, hivePerMVests);
    const backToVests = hpToVests(hp, hivePerMVests);
    expect(backToVests).toBeCloseTo(originalVests);
  });
});

describe('vestsToRshares', () => {
  it('calculates rshares from vests, voting power, and weight', () => {
    const result = vestsToRshares(1000, 10000, 10000);
    // finalVest = 1000 * 1e6 = 1e9
    // power = (10000 * 10000) / 10000 / 50 = 200
    // rshares = (200 * 1e9) / 1000 = 200_000_000
    expect(result).toBe(200_000_000);
  });

  it('returns 0 when vests is 0', () => {
    expect(vestsToRshares(0, 10000, 10000)).toBe(0);
  });

  it('returns 0 when votingPower is 0', () => {
    expect(vestsToRshares(1000, 0, 10000)).toBe(0);
  });

  it('returns 0 when weight is 0', () => {
    expect(vestsToRshares(1000, 10000, 0)).toBe(0);
  });

  it('scales linearly with weight', () => {
    const full = vestsToRshares(1000, 10000, 10000);
    const half = vestsToRshares(1000, 10000, 5000);
    expect(half).toBeCloseTo(full / 2);
  });
});

describe('rcFormatter', () => {
  it('returns raw number for values under 1000', () => {
    expect(rcFormatter(500)).toBe(500);
    expect(rcFormatter(0)).toBe(0);
    expect(rcFormatter(999)).toBe(999);
  });

  it('formats thousands with K suffix', () => {
    expect(rcFormatter(1000)).toBe('1K');
    expect(rcFormatter(1500)).toBe('1.5K');
    expect(rcFormatter(999999)).toBe('1000K');
  });

  it('formats millions with M suffix', () => {
    expect(rcFormatter(1_000_000)).toBe('1M');
    expect(rcFormatter(2_500_000)).toBe('2.5M');
  });

  it('formats billions with B suffix', () => {
    expect(rcFormatter(1_000_000_000)).toBe('1B');
    expect(rcFormatter(1_500_000_000)).toBe('1.5B');
  });

  it('handles negative numbers', () => {
    expect(rcFormatter(-500)).toBe(-500);
    expect(rcFormatter(-1500)).toBe('-1.5K');
    expect(rcFormatter(-2_500_000)).toBe('-2.5M');
  });

  it('strips trailing zeros', () => {
    expect(rcFormatter(2000)).toBe('2K');
    expect(rcFormatter(3_000_000)).toBe('3M');
  });
});
