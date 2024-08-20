import { PollDraft } from '../../providers/ecency/ecency.types';
import {
  SET_BENEFICIARIES,
  REMOVE_EDITOR_CACHE,
  SET_ALLOW_SPK_PUBLISHING,
  SET_POLL_DRAFT,
  REMOVE_POLL_DRAFT,
  SET_DEFAULT_REWARD_TYPE,
} from '../constants/constants';
import { Beneficiary, RewardTypes } from '../reducers/editorReducer';

export const setBeneficiaries = (draftId: string, benficiaries: Beneficiary[]) => ({
  payload: {
    draftId,
    benficiaries,
  },
  type: SET_BENEFICIARIES,
});

export const removeEditorCache = (draftId: string) => ({
  payload: {
    draftId,
  },
  type: REMOVE_EDITOR_CACHE,
});

export const removePollDraft = (draftId: string) => ({
  payload: {
    draftId,
  },
  type: REMOVE_POLL_DRAFT,
});

export const setPollDraftAction = (draftId: string, pollDraft: PollDraft) => ({
  payload: {
    draftId,
    pollDraft,
  },
  type: SET_POLL_DRAFT,
});

export const setAllowSpkPublishing = (allowSpkPublishing: boolean) => ({
  payload: allowSpkPublishing,
  type: SET_ALLOW_SPK_PUBLISHING,
});

export const setDefaultRewardType = (rewardType: RewardTypes | null) => ({
  payload: rewardType,
  type: SET_DEFAULT_REWARD_TYPE,
});
