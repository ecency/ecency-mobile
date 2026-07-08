import type { QuestsResponse } from '@ecency/sdk';

export type WavesOnboardingItemId = 'wave' | 'vote' | 'reply' | 'checkin';

/**
 * DeviceEventEmitter event fired on wave submit success. On chain a wave is a
 * reply into the waves container, so the quests endpoint counts it as comment
 * activity, not post: the only reliable "posted a wave" signal is the submit
 * path itself. The mounted checklist listens and latches the item.
 */
export const WAVES_ONBOARDING_LATCH_EVENT = 'wavesOnboarding:latch';

export interface WavesOnboardingItem {
  id: WavesOnboardingItemId;
  completed: boolean;
}

export interface WavesOnboardingState {
  /** the account is fresh enough (or quiet enough) to be nudged */
  eligible: boolean;
  items: WavesOnboardingItem[];
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
}

const NEW_ACCOUNT_WINDOW_DAYS = 30;
const NEW_ACCOUNT_MAX_POSTS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const dailyProgress = (quests: QuestsResponse, id: string): number =>
  quests.daily?.find((q) => q.id === id)?.progress ?? 0;

export const isNewAccount = (
  account: { created: string; post_count: number },
  now = Date.now(),
): boolean => {
  // Hive timestamps come without a timezone marker but are UTC.
  const { created } = account;
  const createdAt = Date.parse(created.indexOf('Z') === -1 ? `${created}Z` : created);
  const withinWindow =
    Number.isFinite(createdAt) && now - createdAt <= NEW_ACCOUNT_WINDOW_DAYS * DAY_MS;
  return withinWindow || account.post_count < NEW_ACCOUNT_MAX_POSTS;
};

/**
 * Pure derivation of the waves onboarding checklist from the quests endpoint
 * response + account freshness. Daily quest progress resets at 00:00 UTC, so the
 * caller passes completions it already latched to storage: a checklist item must
 * never un-check itself the next day. Returns null until both inputs arrive so
 * callers can distinguish "loading" from "nothing to show". Mirrors the web
 * implementation (vision-next deriveWavesOnboardingState) so both apps behave
 * the same.
 */
export const deriveWavesOnboardingState = (
  quests: QuestsResponse | null | undefined,
  account: { created: string; post_count: number } | null | undefined,
  persistedCompleted: WavesOnboardingItemId[] = [],
  now = Date.now(),
): WavesOnboardingState | null => {
  if (!quests || !account) {
    return null;
  }

  const item = (id: WavesOnboardingItemId, liveComplete: boolean): WavesOnboardingItem => ({
    id,
    completed: liveComplete || persistedCompleted.includes(id),
  });

  const streak = quests.streak?.current ?? 0;
  const items = [
    // No live quest signal: a wave advances the comment quest (it is a reply
    // on chain), so this item completes only via the submit-path latch.
    item('wave', false),
    item('vote', dailyProgress(quests, 'vote') > 0),
    item('reply', dailyProgress(quests, 'comment') > 0),
    item('checkin', dailyProgress(quests, 'checkin') > 0 || streak >= 1),
  ];

  const completedCount = items.filter((i) => i.completed).length;

  return {
    eligible: isNewAccount(account, now),
    items,
    completedCount,
    totalCount: items.length,
    allComplete: completedCount === items.length,
  };
};
