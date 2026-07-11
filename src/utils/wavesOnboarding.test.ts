import { deriveWavesOnboardingState, isNewAccount } from './wavesOnboarding';

const NOW = Date.parse('2026-07-07T12:00:00Z');

const makeQuests = (
  overrides: {
    post?: number;
    vote?: number;
    comment?: number;
    checkin?: number;
    streak?: Record<string, any>;
  } = {},
) => {
  const { post = 0, vote = 0, comment = 0, checkin = 0, streak } = overrides;
  return {
    period: { day: '2026-07-07', week: '2026-W28', month: '2026-07', day_resets_in_secs: 3600 },
    daily: [
      { id: 'checkin', progress: checkin, reward_each: 1 },
      { id: 'post', progress: post, cap: 3 },
      { id: 'comment', progress: comment, cap: 10 },
      { id: 'vote', progress: vote, cap: 30 },
    ],
    weekly: [],
    monthly: [],
    streak: { current: 0, best: 0, at_risk: false, ...streak },
  };
};

const makeAccount = (overrides: { created?: string; post_count?: number } = {}) => ({
  created: '2026-07-01T00:00:00',
  post_count: 0,
  ...overrides,
});

describe('isNewAccount', () => {
  it('treats an account created within the last 30 days as new', () => {
    expect(isNewAccount({ created: '2026-06-20T00:00:00', post_count: 500 }, NOW)).toBe(true);
  });

  it('treats an older account with few posts as new', () => {
    expect(isNewAccount({ created: '2020-01-01T00:00:00', post_count: 9 }, NOW)).toBe(true);
  });

  it('rejects an older, active account', () => {
    expect(isNewAccount({ created: '2020-01-01T00:00:00', post_count: 10 }, NOW)).toBe(false);
  });

  it('falls back to post_count when the created date is malformed', () => {
    expect(isNewAccount({ created: 'not-a-date', post_count: 3 }, NOW)).toBe(true);
    expect(isNewAccount({ created: 'not-a-date', post_count: 300 }, NOW)).toBe(false);
  });
});

describe('deriveWavesOnboardingState', () => {
  it('returns null while the quests query has no data yet', () => {
    expect(deriveWavesOnboardingState(undefined, makeAccount(), [], NOW)).toBeNull();
    expect(deriveWavesOnboardingState(null, makeAccount(), [], NOW)).toBeNull();
  });

  it('returns null while the account has not loaded', () => {
    expect(deriveWavesOnboardingState(makeQuests() as any, undefined, [], NOW)).toBeNull();
    expect(deriveWavesOnboardingState(makeQuests() as any, null, [], NOW)).toBeNull();
  });

  it('returns null for a truthy but partial account object', () => {
    expect(deriveWavesOnboardingState(makeQuests() as any, {} as any, [], NOW)).toBeNull();
    expect(
      deriveWavesOnboardingState(
        makeQuests() as any,
        { created: '2026-07-01T00:00:00' } as any,
        [],
        NOW,
      ),
    ).toBeNull();
  });

  it('starts with every item incomplete for a fresh account', () => {
    const state = deriveWavesOnboardingState(makeQuests() as any, makeAccount(), [], NOW);
    expect(state).toEqual({
      eligible: true,
      items: [
        { id: 'wave', completed: false },
        { id: 'vote', completed: false },
        { id: 'reply', completed: false },
        { id: 'checkin', completed: false },
      ],
      completedCount: 0,
      totalCount: 4,
      allComplete: false,
    });
  });

  it('marks items complete from daily quest progress', () => {
    const state = deriveWavesOnboardingState(
      makeQuests({ post: 1, comment: 2 }) as any,
      makeAccount(),
      [],
      NOW,
    );
    expect(state).toMatchObject({
      items: [
        // A wave counts as comment activity on chain, so the wave item has no
        // live quest signal; it completes only via the submit-path latch.
        { id: 'wave', completed: false },
        { id: 'vote', completed: false },
        { id: 'reply', completed: true },
        { id: 'checkin', completed: false },
      ],
      completedCount: 1,
      allComplete: false,
    });
  });

  it('completes check-in via an active streak even without a check-in today', () => {
    const state = deriveWavesOnboardingState(
      makeQuests({ streak: { current: 2, best: 4 } }) as any,
      makeAccount(),
      [],
      NOW,
    );
    expect(state?.items[3]).toEqual({ id: 'checkin', completed: true });
  });

  it('keeps previously latched items complete after the daily window resets', () => {
    const state = deriveWavesOnboardingState(
      makeQuests() as any,
      makeAccount(),
      ['wave', 'vote'],
      NOW,
    );
    expect(state).toMatchObject({
      items: [
        { id: 'wave', completed: true },
        { id: 'vote', completed: true },
        { id: 'reply', completed: false },
        { id: 'checkin', completed: false },
      ],
      completedCount: 2,
    });
  });

  it('reports allComplete when live progress and latched items cover the list', () => {
    const state = deriveWavesOnboardingState(
      makeQuests({ vote: 3, checkin: 1 }) as any,
      makeAccount(),
      ['wave', 'reply'],
      NOW,
    );
    expect(state).toMatchObject({ completedCount: 4, totalCount: 4, allComplete: true });
  });

  it('flags established accounts as ineligible while still deriving items', () => {
    const state = deriveWavesOnboardingState(
      makeQuests({ post: 1 }) as any,
      makeAccount({ created: '2020-01-01T00:00:00', post_count: 1200 }),
      ['wave'],
      NOW,
    );
    expect(state).toMatchObject({ eligible: false });
    expect(state?.items[0]).toEqual({ id: 'wave', completed: true });
  });

  it('tolerates missing daily and streak sections', () => {
    const state = deriveWavesOnboardingState(
      { ...makeQuests(), daily: undefined, streak: undefined } as any,
      makeAccount(),
      [],
      NOW,
    );
    expect(state).toMatchObject({ completedCount: 0, allComplete: false });
  });
});
