import {
  REMOVE_BENEFICIARIES,
  SET_BENEFICIARIES,
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
  allowSpkPublishing: boolean;
}

const initialState: State = {
  beneficiariesMap: {},
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
    case REMOVE_BENEFICIARIES:
      delete state.beneficiariesMap[payload.draftId];
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
