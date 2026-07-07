import {
  DEFAULT_SUPPORT_PERCENT,
  ECENCY_SUPPORT_ACCOUNT,
  injectEcencySupportBeneficiary,
  isEcencySupportBeneficiary,
  isValidSupportSettings,
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

  it('never bumps an existing smaller ecency route (explicit user weight wins)', () => {
    const input = [
      { account: 'alice', weight: 1000 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 100 },
    ];
    expect(injectEcencySupportBeneficiary(input, 5)).toBe(input);
  });

  it('never lowers an existing larger ecency route', () => {
    const input = [{ account: ECENCY_SUPPORT_ACCOUNT, weight: 2500 }];
    expect(injectEcencySupportBeneficiary(input, 5)).toBe(input);
  });

  it('returns input unchanged when ecency routes already exist, even duplicates', () => {
    const input = [
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 200 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 300 },
    ];
    expect(injectEcencySupportBeneficiary(input, 1)).toBe(input);
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

  it('returns input unchanged for large percents when an ecency route already exists', () => {
    const input = [
      { account: 'alice', weight: 9600 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 100 },
    ];
    expect(injectEcencySupportBeneficiary(input, 100)).toBe(input);
  });

  it('appends the ecency route after existing routes', () => {
    const input = [
      { account: 'alice', weight: 1000 },
      { account: 'bob', weight: 500 },
    ];
    const result = injectEcencySupportBeneficiary(input, 5);
    expect(result).toEqual([
      { account: 'alice', weight: 1000 },
      { account: 'bob', weight: 500 },
      { account: ECENCY_SUPPORT_ACCOUNT, weight: 500 },
    ]);
  });

  it('does not mutate the input array', () => {
    const input = [{ account: 'alice', weight: 1000 }];
    const snapshot = JSON.parse(JSON.stringify(input));
    injectEcencySupportBeneficiary(input, 5);
    expect(input).toEqual(snapshot);
  });

  it('detects an existing ecency route case-insensitively and skips injection', () => {
    const input = [
      { account: 'alice', weight: 1000 },
      { account: 'Ecency', weight: 100 },
    ];
    expect(injectEcencySupportBeneficiary(input, 5)).toBe(input);
    const upper = [{ account: 'ECENCY', weight: 100 }];
    expect(injectEcencySupportBeneficiary(upper, 5)).toBe(upper);
  });

  it('always injects the route with lowercase account name', () => {
    const result = injectEcencySupportBeneficiary([{ account: 'alice', weight: 1000 }], 5);
    expect(result).toContainEqual({ account: 'ecency', weight: 500 });
  });
});

describe('isEcencySupportBeneficiary', () => {
  it('matches any casing of the ecency account', () => {
    expect(isEcencySupportBeneficiary('ecency')).toBe(true);
    expect(isEcencySupportBeneficiary('Ecency')).toBe(true);
    expect(isEcencySupportBeneficiary('ECENCY')).toBe(true);
  });

  it('rejects other accounts and non-strings', () => {
    expect(isEcencySupportBeneficiary('alice')).toBe(false);
    expect(isEcencySupportBeneficiary('ecency2')).toBe(false);
    expect(isEcencySupportBeneficiary(undefined)).toBe(false);
  });
});

describe('isValidSupportSettings', () => {
  it('accepts a payload with finite percents', () => {
    expect(isValidSupportSettings({ beneficiary_percent: 5, curation_percent: 0 })).toBe(true);
    expect(isValidSupportSettings({ beneficiary_percent: 0, curation_percent: 100 })).toBe(true);
  });

  it('rejects malformed payloads', () => {
    expect(isValidSupportSettings(null)).toBe(false);
    expect(isValidSupportSettings(undefined)).toBe(false);
    expect(isValidSupportSettings({})).toBe(false);
    expect(isValidSupportSettings({ beneficiary_percent: 5 })).toBe(false);
    expect(isValidSupportSettings({ beneficiary_percent: '5', curation_percent: 0 })).toBe(false);
    expect(isValidSupportSettings({ beneficiary_percent: NaN, curation_percent: 0 })).toBe(false);
  });
});
