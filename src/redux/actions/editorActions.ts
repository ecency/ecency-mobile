import { SET_BENEFICIARIES, REMOVE_BENEFICIARIES, SET_ALLOW_SPK_PUBLISHING } from '../constants/constants';
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

export const setAllowSpkPublishing = (allowSpkPublishing:boolean) => ({
  payload:allowSpkPublishing,
  type:SET_ALLOW_SPK_PUBLISHING
})
