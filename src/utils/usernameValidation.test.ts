import { getUsernameError } from './usernameValidation';

describe('getUsernameError', () => {
  it('accepts valid usernames', () => {
    expect(getUsernameError('ecency')).toBeNull();
    expect(getUsernameError('abc')).toBeNull();
    expect(getUsernameError('good-karma')).toBeNull();
    expect(getUsernameError('user123')).toBeNull();
    expect(getUsernameError('abc1')).toBeNull();
    expect(getUsernameError('foo.barbaz')).toBeNull();
    expect(getUsernameError('abc.def.ghi')).toBeNull(); // multi-dot segments
    expect(getUsernameError('a23456789012345b')).toBeNull(); // 16 chars
  });

  it('rejects usernames not starting with a letter', () => {
    expect(getUsernameError('31454476')).toBe('start_letter');
    expect(getUsernameError('1abc')).toBe('start_letter');
    expect(getUsernameError('-abc')).toBe('start_letter');
    expect(getUsernameError('abc.123abc')).toBe('start_letter');
  });

  it('rejects every segment, not just one valid segment', () => {
    // an invalid segment must fail the whole name even when a later
    // segment is valid on its own
    expect(getUsernameError('123.validname')).toBe('start_letter');
    expect(getUsernameError('validname.123')).toBe('start_letter');
  });

  it('rejects bad lengths', () => {
    expect(getUsernameError('')).toBe('length');
    expect(getUsernameError('ab')).toBe('length');
    expect(getUsernameError('a2345678901234567')).toBe('length'); // 17 chars
    expect(getUsernameError('ab.cde')).toBe('length'); // short segment
    expect(getUsernameError('abc.')).toBe('length'); // empty segment
  });

  it('rejects invalid symbols', () => {
    expect(getUsernameError('ab@c')).toBe('symbols');
    expect(getUsernameError('abc!')).toBe('symbols');
    expect(getUsernameError('abc def')).toBe('symbols');
  });

  it('rejects trailing hyphens', () => {
    expect(getUsernameError('abc-')).toBe('trailing_hyphen');
    expect(getUsernameError('abc-.defg')).toBe('trailing_hyphen');
  });

  it('rejects double hyphens and underscores', () => {
    expect(getUsernameError('ab--cd')).toBe('double_hyphens');
    expect(getUsernameError('ab_cd')).toBe('underscore');
  });
});
