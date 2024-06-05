import { PollMetadata } from '../../providers/hive/hive.types';
import {
  REMOVE_EDITOR_CACHE,
  SET_BENEFICIARIES,
  SET_POLL_META,
  SET_ALLOW_SPK_PUBLISHING,
} from '../constants/constants';

export interface Beneficiary {
  account: string;
  weight: number;
  isValid?: boolean;
  autoPowerUp?: boolean;
}

interface State {
  beneficiariesMap: {
    [key: string]: Beneficiary[];
  };
  pollsMetaMap: {
    [key: string]: PollMetadata;
  }
  allowSpkPublishing: boolean;
}

const initialState: State = {
  beneficiariesMap: {},
  pollsMetaMap: {},
  allowSpkPublishing: false,
};

const editorReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_BENEFICIARIES:
      state.beneficiariesMap[payload.draftId] = payload.benficiaries;
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };
    case SET_POLL_META:
      state.pollsMetaMap[payload.draftId] = payload.pollMeta;
      return {
        ...state
      }
    case REMOVE_EDITOR_CACHE:
      delete state.beneficiariesMap[payload.draftId];
      delete state.pollsMetaMap[payload.draftId];
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };

    case SET_ALLOW_SPK_PUBLISHING:
      return {
        ...state,
        allowSpkPublishing: payload,
      };
    default:
      return state;
  }
};

export default editorReducer;
