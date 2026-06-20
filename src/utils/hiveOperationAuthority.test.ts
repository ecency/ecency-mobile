import { resolveOperationAuthority, resolveTxRequiredAuthority } from './hiveOperationAuthority';

describe('resolveOperationAuthority', () => {
  it('account_update2 changing only posting_json_metadata -> posting', () => {
    expect(
      resolveOperationAuthority([
        'account_update2',
        {
          account: 'alice',
          json_metadata: '',
          posting_json_metadata: '{"profile":{"pinned":"x"}}',
          extensions: [],
        },
      ] as any),
    ).toBe('posting');
  });

  it('account_update2 changing posting authority -> active', () => {
    expect(
      resolveOperationAuthority([
        'account_update2',
        {
          account: 'alice',
          posting: { weight_threshold: 1, account_auths: [], key_auths: [] },
          json_metadata: '',
          posting_json_metadata: '',
          extensions: [],
        },
      ] as any),
    ).toBe('active');
  });

  it('account_update2 also changing json_metadata -> active', () => {
    expect(
      resolveOperationAuthority([
        'account_update2',
        { account: 'alice', json_metadata: '{"x":1}', posting_json_metadata: '' },
      ] as any),
    ).toBe('active');
  });

  it('account_update2 changing memo_key -> active', () => {
    expect(
      resolveOperationAuthority([
        'account_update2',
        { account: 'alice', memo_key: 'STM8x', json_metadata: '', posting_json_metadata: '' },
      ] as any),
    ).toBe('active');
  });

  it('account_update (v1) -> active', () => {
    expect(
      resolveOperationAuthority(['account_update', { account: 'alice', json_metadata: '' }] as any),
    ).toBe('active');
  });

  it('vote -> posting', () => {
    expect(resolveOperationAuthority(['vote', {}] as any)).toBe('posting');
  });

  it('custom_json without required_auths -> posting', () => {
    expect(
      resolveOperationAuthority([
        'custom_json',
        { required_auths: [], required_posting_auths: ['alice'] },
      ] as any),
    ).toBe('posting');
  });

  it('custom_json with required_auths -> active', () => {
    expect(resolveOperationAuthority(['custom_json', { required_auths: ['alice'] }] as any)).toBe(
      'active',
    );
  });

  it('transfer -> active', () => {
    expect(resolveOperationAuthority(['transfer', {}] as any)).toBe('active');
  });
});

describe('resolveTxRequiredAuthority', () => {
  it('empty tx -> posting', () => {
    expect(resolveTxRequiredAuthority([])).toBe('posting');
  });

  it('all-posting tx -> posting', () => {
    expect(
      resolveTxRequiredAuthority([
        ['vote', {}],
        ['account_update2', { posting_json_metadata: '{}', json_metadata: '' }],
      ] as any),
    ).toBe('posting');
  });

  it('any active op -> active', () => {
    expect(
      resolveTxRequiredAuthority([
        ['vote', {}],
        ['transfer', {}],
      ] as any),
    ).toBe('active');
  });
});
