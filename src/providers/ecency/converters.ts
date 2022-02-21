import { Referral } from '../../models';
import { ReferralStat } from './ecency.types';

export const convertReferral = (rawData: any) => {
  return {
    _id: rawData.id || 0,
    referral: rawData.referral || '',
    referredUsername: rawData.username || '',
    isRewarded: rawData.rewarded ? true : false,
    timestamp: new Date(rawData.created) || new Date(),
  } as Referral;
};

export const convertReferralStat = (rawData: any) => {
  return {
    total: rawData.total || 0,
    rewarded: rawData.rewarded || 0,
  } as ReferralStat;
};
