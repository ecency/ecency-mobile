import { PollDraft } from '../../providers/ecency/ecency.types';
import {
  REMOVE_EDITOR_CACHE,
  SET_BENEFICIARIES,
  SET_POLL_DRAFT,
  SET_DRAFT_CARET,
  SET_ALLOW_SPK_PUBLISHING,
  REMOVE_POLL_DRAFT,
  SET_DEFAULT_REWARD_TYPE,
} from '../constants/constants';

export interface Beneficiary {
  account: string;
  weight: number;
  isValid?: boolean;
  autoPowerUp?: boolean;
}

export enum RewardTypes {
  DEAFULT = 'default',
  SP = 'sp',
  DP = 'dp',
}

interface State {
  beneficiariesMap: {
    [key: string]: Beneficiary[];
  };
  pollDraftsMap: {
    [key: string]: PollDraft;
  };
  // Last-known caret offset per draft, used to restore the editing position
  // when a draft is reopened instead of jumping to the end of the body.
  caretMap: {
    [key: string]: number;
  };
  allowSpkPublishing: boolean;
  defaultRewardType: RewardTypes | null;
}

const initialState: State = {
  beneficiariesMap: {},
  pollDraftsMap: {},
  caretMap: {},
  allowSpkPublishing: false,
  defaultRewardType: RewardTypes.DEAFULT,
};

const editorReducer = (state = initialState, action: any) => {
  const { type, payload } = action;
  switch (type) {
    case SET_BENEFICIARIES:
      if (!state.beneficiariesMap) {
        state.beneficiariesMap = {};
      }

      state.beneficiariesMap = {
        ...state.beneficiariesMap,
        [payload.draftId]: payload.benficiaries,
      };

      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };
    case SET_POLL_DRAFT:
      if (!state.pollDraftsMap) {
        state.pollDraftsMap = {};
      }

      state.pollDraftsMap = {
        ...state.pollDraftsMap,
        [payload.draftId]: payload.pollDraft,
      };

      return {
        ...state,
      };
    case SET_DRAFT_CARET:
      if (!state.caretMap) {
        state.caretMap = {};
      }

      state.caretMap = {
        ...state.caretMap,
        [payload.draftId]: payload.caret,
      };

      return {
        ...state,
      };
    case REMOVE_EDITOR_CACHE:
      delete state.beneficiariesMap[payload.draftId];
      delete state.pollDraftsMap[payload.draftId];
      if (state.caretMap) {
        delete state.caretMap[payload.draftId];
      }
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };

    case REMOVE_POLL_DRAFT:
      delete state.pollDraftsMap[payload.draftId];
      state.pollDraftsMap = {
        ...state.pollDraftsMap,
      };
      return {
        ...state,
      };

    case SET_ALLOW_SPK_PUBLISHING:
      return {
        ...state,
        allowSpkPublishing: payload,
      };
    case SET_DEFAULT_REWARD_TYPE:
      return {
        ...state,
        defaultRewardType: payload,
      };
    default:
      return state;
  }
};

export default editorReducer;
