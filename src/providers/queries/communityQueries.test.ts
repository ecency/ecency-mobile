import fs from 'fs';
import path from 'path';
import {
  applyRoleToSubscribersCache,
  useCommunitySubscribersQuery,
  SUBSCRIBERS_PAGE_SIZE,
} from './communityQueries';

describe('communityQueries module surface', () => {
  it('exports useCommunitySubscribersQuery as a function', () => {
    expect(typeof useCommunitySubscribersQuery).toBe('function');
  });

  // The members screen imports this hook through the `providers/queries` barrel.
  // Shipping the module without the re-export resolves that import to undefined
  // and crashes the screen on mount, which neither eslint nor any other test
  // catches. The barrel itself cannot be imported here (it pulls in native
  // modules through sdk-config), so assert the re-export at the source level.
  it('is re-exported from the queries barrel', () => {
    const barrel = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');
    expect(barrel).toMatch(/export \* from '\.\/communityQueries';/);
  });

  it("pages at hivemind's list_subscribers cap", () => {
    // hivemind caps list_subscribers at 100 rows regardless of a larger limit,
    // and getNextPageParam treats a short page as the end of the list. A page
    // size above the cap would make every full page look short and stop paging
    // after the first one.
    expect(SUBSCRIBERS_PAGE_SIZE).toBeLessThanOrEqual(100);
  });
});

describe('applyRoleToSubscribersCache', () => {
  // hivemind rows are [account, role, title, joined].
  const cache = {
    pages: [
      [
        ['alice', 'mod', 'Head mod', '2024-01-01T00:00:00'],
        ['bob', 'guest', '', '2024-02-01T00:00:00'],
      ],
      [['carol', 'member', '', '2024-03-01T00:00:00']],
    ],
    pageParams: ['', 'bob'],
  };

  it('rewrites the role on the matching account only', () => {
    const next = applyRoleToSubscribersCache(cache, 'bob', 'mod');
    expect(next?.pages?.[0][1]).toEqual(['bob', 'mod', '', '2024-02-01T00:00:00']);
    expect(next?.pages?.[0][0]).toEqual(['alice', 'mod', 'Head mod', '2024-01-01T00:00:00']);
  });

  it('reaches accounts on later pages', () => {
    const next = applyRoleToSubscribersCache(cache, 'carol', 'muted');
    expect(next?.pages?.[1][0]).toEqual(['carol', 'muted', '', '2024-03-01T00:00:00']);
  });

  it('preserves the rest of the tuple, including title and joined date', () => {
    const next = applyRoleToSubscribersCache(cache, 'alice', 'admin');
    expect(next?.pages?.[0][0]).toEqual(['alice', 'admin', 'Head mod', '2024-01-01T00:00:00']);
  });

  it('keeps pageParams so paging continues from the same cursor', () => {
    expect(applyRoleToSubscribersCache(cache, 'bob', 'mod')?.pageParams).toEqual(['', 'bob']);
  });

  it('does not mutate the cached object', () => {
    const snapshot = JSON.parse(JSON.stringify(cache));
    applyRoleToSubscribersCache(cache, 'bob', 'muted');
    expect(cache).toEqual(snapshot);
  });

  it('is a no-op for an account that is not cached', () => {
    expect(applyRoleToSubscribersCache(cache, 'nobody', 'mod')).toEqual(cache);
  });

  it('handles an absent or empty cache', () => {
    expect(applyRoleToSubscribersCache(undefined, 'bob', 'mod')).toBeUndefined();
    expect(applyRoleToSubscribersCache({}, 'bob', 'mod')).toEqual({});
  });
});
