import { REMOVE_BENEFICIARIES, SET_BENEFICIARIES } from '../constants/constants';

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
}

const initialState: State = {
  beneficiariesMap: {},
};

export default function (state = initialState, action) {
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
    default:
      return state;
  }
}
