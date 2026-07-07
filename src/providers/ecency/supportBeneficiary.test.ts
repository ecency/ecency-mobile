import {
  DEFAULT_SUPPORT_PERCENT,
  ECENCY_SUPPORT_ACCOUNT,
  injectEcencySupportBeneficiary,
} from './supportBeneficiary';

describe('injectEcencySupportBeneficiary', () => {
  it('returns input unchanged for percent 0', () => {
    const input = [{ account: 'alice', weight: 1000 }];
    expect(injectEcencySupportBeneficiary(input, 0)).toBe(input);
  });

  it('returns input unchanged for negative percent', () => {
    const input = [{ account: 'alice', weight: 1000 }];
    expect(injectEcencySupportBeneficiary(input, -5)).toBe(input);
  });

  it('returns input unchanged for non-finite percent', () => {
    const input = [{ account: 'alice', weight: 1000 }];
    expect(injectEcencySupportBeneficiary(input, NaN)).toBe(input);
    expect(injectEcencySupportBeneficiary(input, Infinity)).toBe(input);
  });

  it('adds a single ecency route with weight = percent * 100', () => {
    const result = injectEcencySupportBeneficiary([], DEFAULT_SUPPORT_PERCENT);
    expect(result).toEqual([{ account: ECENCY_SUPPORT_ACCOUNT, weight: 500 }]);
  });

  it('preserves existing routes when injecting', () => {
    const input = [{ account: 'alice', weight: 1000 }];
    const result = injectEcencySupportBeneficiary(input, 10);
    expect(result).toEqual([
      { account: 'alice', weight: 1000 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 1000 },
    ]);
  });

  it('bumps an existing smaller ecency route to the larger weight without duplicating', () => {
    const input = [
      { account: 'alice', weight: 1000 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 100 },
    ];
    const result = injectEcencySupportBeneficiary(input, 5);
    expect(result.filter((item) => item.account === ECENCY_SUPPORT_ACCOUNT)).toHaveLength(1);
    expect(result).toEqual(
      expect.arrayContaining([
        { account: 'alice', weight: 1000 },
        { account: ECENCY_SUPPORT_ACCOUNT, weight: 500 },
      ]),
    );
    expect(result).toHaveLength(2);
  });

  it('keeps an existing larger ecency route weight', () => {
    const input = [{ account: ECENCY_SUPPORT_ACCOUNT, weight: 2500 }];
    const result = injectEcencySupportBeneficiary(input, 5);
    expect(result).toEqual([{ account: ECENCY_SUPPORT_ACCOUNT, weight: 2500 }]);
  });

  it('collapses duplicate ecency routes into one, keeping the largest weight', () => {
    const input = [
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 200 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 300 },
    ];
    const result = injectEcencySupportBeneficiary(input, 1);
    expect(result).toEqual([{ account: ECENCY_SUPPORT_ACCOUNT, weight: 300 }]);
  });

  it('skips injection when it would exceed 8 routes', () => {
    const input = Array.from({ length: 8 }, (_, i) => ({ account: `user${i}`, weight: 100 }));
    expect(injectEcencySupportBeneficiary(input, 5)).toBe(input);
  });

  it('allows injection when result is exactly 8 routes', () => {
    const input = Array.from({ length: 7 }, (_, i) => ({ account: `user${i}`, weight: 100 }));
    const result = injectEcencySupportBeneficiary(input, 5);
    expect(result).toHaveLength(8);
    expect(result).toContainEqual({ account: ECENCY_SUPPORT_ACCOUNT, weight: 500 });
  });

  it('skips injection when total weight would exceed 10000', () => {
    const input = [{ account: 'alice', weight: 9600 }];
    expect(injectEcencySupportBeneficiary(input, 5)).toBe(input);
  });

  it('allows injection when total weight is exactly 10000', () => {
    const input = [{ account: 'alice', weight: 9500 }];
    const result = injectEcencySupportBeneficiary(input, 5);
    expect(result).toEqual([
      { account: 'alice', weight: 9500 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 500 },
    ]);
  });

  it('skips bumping an existing route when the bump would exceed 10000 total weight', () => {
    const input = [
      { account: 'alice', weight: 9600 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 100 },
    ];
    expect(injectEcencySupportBeneficiary(input, 100)).toBe(input);
  });

  it('does not mutate the input array', () => {
    const input = [{ account: 'alice', weight: 1000 }];
    const snapshot = JSON.parse(JSON.stringify(input));
    injectEcencySupportBeneficiary(input, 5);
    expect(input).toEqual(snapshot);
  });
});
