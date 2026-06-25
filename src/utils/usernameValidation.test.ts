import { getUsernameError, USERNAME_ERROR_MESSAGE_IDS } from './usernameValidation';

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

  it('rejects a too-short trailing dot-segment (paid-signup incident)', () => {
    // A buyer was charged for `bitgethive.uk`: the whole name is 13 chars but the
    // `uk` segment is only 2, which the blockchain rejects (RFC 1035). The paid
    // path had no client-side check, so the on-chain create failed after payment.
    expect(getUsernameError('bitgethive.uk')).toBe('length');
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

  it('rejects names that resemble a known exchange account', () => {
    // chain-valid but confusable with an exchange deposit account
    expect(getUsernameError('bittrex')).toBe('exchange');
    expect(getUsernameError('huobi-pro')).toBe('exchange');
    expect(getUsernameError('mybittrex')).toBe('exchange');
    expect(getUsernameError('coinex')).toBe('exchange'); // brand prefix of coinexdeposit
    expect(getUsernameError('bittrx')).toBe('exchange'); // single-char typo
    expect(getUsernameError('bitgethive')).toBe('exchange');
    expect(getUsernameError('bitget')).toBe('exchange'); // brand core of bitgethive
  });

  it('rejects the uid + digits impersonation pattern', () => {
    expect(getUsernameError('uid12345')).toBe('restricted');
    expect(getUsernameError('uid007name')).toBe('restricted');
  });

  it('reports a format error before the exchange-resemblance error', () => {
    // a malformed look-alike should surface its chain-validity error first
    expect(getUsernameError('bittrex-')).toBe('trailing_hyphen');
  });

  it('does not flag ordinary names that merely share a fragment', () => {
    expect(getUsernameError('trade')).toBeNull(); // substring of blocktrades, not a prefix
    expect(getUsernameError('deposit')).toBeNull();
    expect(getUsernameError('blockchain')).toBeNull();
    expect(getUsernameError('changelog')).toBeNull(); // 2 edits from changelly
    expect(getUsernameError('block')).toBeNull(); // prefix of blocktrades
    expect(getUsernameError('change')).toBeNull(); // prefix of changelly
    expect(getUsernameError('druid')).toBeNull(); // contains uid but not a prefix
    expect(getUsernameError('uidev')).toBeNull(); // uid + letter, not the digit pattern
  });
});

describe('USERNAME_ERROR_MESSAGE_IDS', () => {
  it('maps every validation error code to a register.validation message id', () => {
    const codes = [
      'length',
      'start_letter',
      'symbols',
      'double_hyphens',
      'trailing_hyphen',
      'underscore',
      'exchange',
      'restricted',
    ] as const;
    codes.forEach((code) => {
      expect(USERNAME_ERROR_MESSAGE_IDS[code]).toMatch(/^register\.validation\./);
    });
  });
});
