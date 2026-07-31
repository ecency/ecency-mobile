import fs from 'fs';
import path from 'path';
import { useCommunitySubscribersQuery, SUBSCRIBERS_PAGE_SIZE } from './communityQueries';

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
