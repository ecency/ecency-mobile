import * as hiveuri from 'hive-uri';
import {
  normalizeScannedUsername,
  extractUsernameFromScannedValue,
} from './transferRecipientParser';

const encode = (op: [string, Record<string, any>]) => hiveuri.encodeOps([op]);

describe('normalizeScannedUsername', () => {
  it('trims, strips a leading @, and lowercases', () => {
    expect(normalizeScannedUsername('  @Alice ')).toBe('alice');
    expect(normalizeScannedUsername('BOB')).toBe('bob');
    expect(normalizeScannedUsername(undefined)).toBe('');
  });
});

describe('extractUsernameFromScannedValue', () => {
  describe('hive-uri operations', () => {
    it('extracts the recipient from a transfer op', () => {
      const uri = encode([
        'transfer',
        { from: '__signer', to: 'alice', amount: '1.000 HIVE', memo: '' },
      ]);
      expect(extractUsernameFromScannedValue(uri)).toBe('alice');
    });

    it('extracts the recipient from a recurrent_transfer op', () => {
      const uri = encode([
        'recurrent_transfer',
        {
          from: '__signer',
          to: 'bob',
          amount: '1.000 HIVE',
          memo: '',
          recurrence: 24,
          executions: 2,
          extensions: [],
        },
      ]);
      expect(extractUsernameFromScannedValue(uri)).toBe('bob');
    });

    it('does NOT mine a recipient from create_proposal.receiver', () => {
      const uri = encode([
        'create_proposal',
        {
          creator: '__signer',
          receiver: 'attacker',
          start_date: '2020-01-01T00:00:00',
          end_date: '2020-02-01T00:00:00',
          daily_pay: '1.000 HBD',
          subject: 'x',
          permlink: 'y',
          extensions: [],
        },
      ]);
      expect(extractUsernameFromScannedValue(uri)).toBe('');
    });

    it('does NOT mine a recipient from account_witness_vote.account', () => {
      const uri = encode([
        'account_witness_vote',
        { account: '__signer', witness: 'attacker', approve: true },
      ]);
      expect(extractUsernameFromScannedValue(uri)).toBe('');
    });

    it('ignores an unresolved __signer placeholder in the recipient field', () => {
      const uri = encode([
        'transfer',
        { from: 'alice', to: '__signer', amount: '1.000 HIVE', memo: '' },
      ]);
      expect(extractUsernameFromScannedValue(uri)).toBe('');
    });
  });

  describe('non hive-uri values', () => {
    it('reads ?to= / ?username= / ?account= query params', () => {
      expect(extractUsernameFromScannedValue('https://ecency.com/transfer?to=Alice')).toBe('alice');
      expect(extractUsernameFromScannedValue('app://x?username=bob&amount=1')).toBe('bob');
      expect(extractUsernameFromScannedValue('?account=%40carol')).toBe('carol');
    });

    it('reads a profile/path username', () => {
      expect(extractUsernameFromScannedValue('https://ecency.com/@dave')).toBe('dave');
      expect(extractUsernameFromScannedValue('https://hive.blog/profile/eve')).toBe('eve');
    });

    it('accepts a bare valid username', () => {
      expect(extractUsernameFromScannedValue('frank')).toBe('frank');
      expect(extractUsernameFromScannedValue('@Grace')).toBe('grace');
    });

    it('rejects values that are not a plausible username', () => {
      expect(extractUsernameFromScannedValue('ab')).toBe('');
      expect(extractUsernameFromScannedValue('this-name-is-way-too-long')).toBe('');
      expect(extractUsernameFromScannedValue('not a username!')).toBe('');
    });
  });
});
