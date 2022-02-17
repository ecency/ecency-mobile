import { Referral } from '../../models';
import parseDate from '../../utils/parseDate';

export const convertReferral = (rawData: any) => {
  return {
    _id: rawData.id || 0,
    referral: rawData.referral || '',
    referredUsername: rawData.username || '',
    isRewarded: rawData.rewarded ? true : false,
    timestamp: parseDate(rawData.created) || new Date(),
  } as Referral;
};
