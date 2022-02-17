import { Referral } from '../../models';

export const convertReferral = (rawData: any) => {
  return {
    _id: rawData.id || 0,
    referral: rawData.referral || '',
    referredUsername: rawData.username || '',
    isRewarded: rawData.rewarded ? true : false,
    timestamp: new Date(rawData.created) || new Date(),
  } as Referral;
};
