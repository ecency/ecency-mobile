import { getQuestCatalogEntry } from '@ecency/sdk';
import type { QuestsResponse } from '@ecency/sdk';

export interface QuestChipState {
  visible: boolean;
  postedToday: boolean;
  postProgress: number;
  postGoal: number;
  streakCurrent: number;
  atRisk: boolean;
}

/**
 * Derives the editor quest chip state from the quests endpoint response.
 * Returns null until quest data has arrived. The chip is worth showing when
 * the user has an active streak to protect or has not completed the daily
 * post quest yet.
 */
export const deriveQuestChipState = (quests?: QuestsResponse | null): QuestChipState | null => {
  if (!quests) {
    return null;
  }

  const postQuest = quests.daily?.find((q) => q.id === 'post');
  const postGoal = getQuestCatalogEntry('daily', 'post')?.goal ?? 1;
  const postProgress = Math.max(0, postQuest?.progress ?? 0);
  const postedToday = postProgress >= postGoal;
  const streakCurrent = Math.max(0, quests.streak?.current ?? 0);
  const atRisk = streakCurrent > 0 && !!quests.streak?.at_risk;

  return {
    visible: streakCurrent > 0 || !postedToday,
    postedToday,
    postProgress,
    postGoal,
    streakCurrent,
    atRisk,
  };
};
