import { SET_BENEFICIARIES, REMOVE_BENEFICIARIES } from '../constants/constants';
import { Beneficiary } from '../reducers/editorReducer';

export const setBeneficiaries = (draftId: string, benficiaries: Beneficiary[]) => ({
  payload: {
    draftId,
    benficiaries,
  },
  type: SET_BENEFICIARIES,
});

export const removeBeneficiaries = (draftId: string) => ({
  payload: {
    draftId,
  },
  type: REMOVE_BENEFICIARIES,
});
