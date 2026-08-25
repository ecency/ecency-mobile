// The hooks barrel drags native module chains (expo etc.), so stub it before
// importing the module under test; only the pure exports are exercised here.
jest.mock('../../hooks', () => ({
  useAuth: jest.fn(() => ({ username: undefined, code: undefined })),
}));

// eslint-disable-next-line import/first
import fs from 'fs';
// eslint-disable-next-line import/first
import path from 'path';
// The queries barrel drags store/navigation/native chains, so import the
// module file directly and assert the barrel re-export textually instead
// (communityQueries.test.ts precedent).
// eslint-disable-next-line import/first
import type { DigestSubscription } from '@ecency/sdk';
// eslint-disable-next-line import/first
import {
  MOBILE_DIGEST_SOURCE,
  findDigestSubscription,
  knownDigestAddress,
} from './newsletterQueries';

const sub = (over: Partial<DigestSubscription>): DigestSubscription => ({
  id: 'id-1',
  email: 'alice@example.com',
  account: 'alice',
  type: 'creator',
  target: 'alice',
  cadence: 'weekly',
  status: 'active',
  created_at: '2026-08-25T00:00:00Z',
  ...over,
});

describe('findDigestSubscription', () => {
  it('matches on type AND target, target case-insensitively', () => {
    const subs = [
      sub({ id: 'a', type: 'creator', target: 'Alice' }),
      sub({ id: 'b', type: 'community', target: 'hive-125125' }),
    ];
    expect(findDigestSubscription(subs, 'creator', 'alice')?.id).toBe('a');
    expect(findDigestSubscription(subs, 'community', 'HIVE-125125')?.id).toBe('b');
    expect(findDigestSubscription(subs, 'community', 'alice')).toBeUndefined();
    expect(findDigestSubscription(undefined, 'creator', 'alice')).toBeUndefined();
  });
});

describe('knownDigestAddress', () => {
  it('returns the first address on file, null when none is known', () => {
    expect(knownDigestAddress(undefined)).toBeNull();
    expect(knownDigestAddress([])).toBeNull();
    expect(knownDigestAddress([sub({ email: 'a@example.com' })])).toBe('a@example.com');
  });
});

describe('module wiring', () => {
  it('uses the relay-allowlisted source value', () => {
    // The relay 400s any unknown source, so this string is a contract.
    expect(MOBILE_DIGEST_SOURCE).toBe('mobile-app');
  });

  it('is re-exported from the queries barrel', () => {
    const barrel = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');
    expect(barrel).toMatch(/export \* from '\.\/newsletterQueries';/);
  });
});
