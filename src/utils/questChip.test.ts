import { deriveQuestChipState } from './questChip';

jest.mock('@ecency/sdk', () => ({
  getQuestCatalogEntry: jest.fn((tier: string, id: string) =>
    tier === 'daily' && id === 'post'
      ? { id: 'post', tier: 'daily', goal: 1, i18nKey: 'post', icon: 'pencil' }
      : undefined,
  ),
}));

const quests = (overrides: any = {}) => ({
  period: { day: '2026-07-06', week: '2026-W28', month: '2026-07', day_resets_in_secs: 3600 },
  daily: [{ id: 'post', progress: 0, cap: 3 }],
  weekly: [],
  monthly: [],
  streak: { current: 0, best: 0, at_risk: false },
  ...overrides,
});

describe('deriveQuestChipState', () => {
  it('returns null until quest data has arrived', () => {
    expect(deriveQuestChipState(undefined)).toBeNull();
    expect(deriveQuestChipState(null)).toBeNull();
  });

  it('is visible when the daily post quest is incomplete and there is no streak', () => {
    expect(deriveQuestChipState(quests() as any)).toEqual({
      visible: true,
      postedToday: false,
      postProgress: 0,
      postGoal: 1,
      streakCurrent: 0,
      atRisk: false,
    });
  });

  it('hides once the daily post quest is complete and there is no streak', () => {
    const state = deriveQuestChipState(
      quests({ daily: [{ id: 'post', progress: 1, cap: 3 }] }) as any,
    );
    expect(state).toEqual({
      visible: false,
      postedToday: true,
      postProgress: 1,
      postGoal: 1,
      streakCurrent: 0,
      atRisk: false,
    });
  });

  it('stays visible after posting when a streak is active', () => {
    const state = deriveQuestChipState(
      quests({
        daily: [{ id: 'post', progress: 2, cap: 3 }],
        streak: { current: 5, best: 9, at_risk: false },
      }) as any,
    );
    expect(state).toEqual({
      visible: true,
      postedToday: true,
      postProgress: 2,
      postGoal: 1,
      streakCurrent: 5,
      atRisk: false,
    });
  });

  it('flags at-risk only while a streak is active', () => {
    const atRisk = deriveQuestChipState(
      quests({ streak: { current: 3, best: 3, at_risk: true } }) as any,
    );
    expect(atRisk?.atRisk).toBe(true);
    expect(atRisk?.visible).toBe(true);

    const noStreak = deriveQuestChipState(
      quests({ streak: { current: 0, best: 3, at_risk: true } }) as any,
    );
    expect(noStreak?.atRisk).toBe(false);
  });

  it('treats a missing daily post quest as zero progress', () => {
    const state = deriveQuestChipState(
      quests({ daily: [{ id: 'comment', progress: 4, cap: 25 }] }) as any,
    );
    expect(state).toEqual({
      visible: true,
      postedToday: false,
      postProgress: 0,
      postGoal: 1,
      streakCurrent: 0,
      atRisk: false,
    });
  });

  it('tolerates missing daily and streak sections', () => {
    const state = deriveQuestChipState(quests({ daily: undefined, streak: undefined }) as any);
    expect(state).toEqual({
      visible: true,
      postedToday: false,
      postProgress: 0,
      postGoal: 1,
      streakCurrent: 0,
      atRisk: false,
    });
  });
});
