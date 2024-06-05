import { PollDraft } from '../../providers/ecency/ecency.types';
import { PollMetadata } from '../../providers/hive/hive.types';
import {
  SET_BENEFICIARIES,
  REMOVE_EDITOR_CACHE,
  SET_ALLOW_SPK_PUBLISHING,
  SET_POLL_DRAFT,
} from '../constants/constants';
import { Beneficiary } from '../reducers/editorReducer';

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
