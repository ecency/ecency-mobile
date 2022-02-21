export interface Referral {
  _id: number;
  referral: string;
  referredUsername: string;
  isRewarded: boolean;
  timestamp: Date;
}
