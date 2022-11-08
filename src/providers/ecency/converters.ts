import { COIN_IDS } from '../../constants/defaultCoins';
import { Referral } from '../../models';
import {
  CommentHistoryItem,
  LatestMarketPrices,
  LatestQuotes,
  QuoteItem,
  ReferralStat,
} from './ecency.types';

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

export const convertQuoteItem = (rawData: any, currencyRate: number) => {
  if (!rawData) {
    return null;
  }
  return {
    price: rawData.price * currencyRate,
    percentChange: rawData.percent_change,
    lastUpdated: rawData.last_updated,
  } as QuoteItem;
};

export const convertLatestQuotes = (rawData: any, currencyRate: number) => {
  return {
    [COIN_IDS.HIVE]: convertQuoteItem(rawData.hive.quotes.usd, currencyRate),
    [COIN_IDS.HP]: convertQuoteItem(rawData.hive.quotes.usd, currencyRate),
    [COIN_IDS.HBD]: convertQuoteItem(rawData.hbd.quotes.usd, currencyRate),
    [COIN_IDS.ECENCY]: convertQuoteItem(rawData.estm.quotes.usd, currencyRate),
  } as LatestQuotes;
};

export const convertCommentHistory = (rawData: any) => {
  return {
    body: rawData.body || '',
    tags: rawData.tags || '',
    timestamp: rawData.timestamp || '',
    title: rawData.title || '',
    v: rawData.v || 1,
  } as CommentHistoryItem;
};
