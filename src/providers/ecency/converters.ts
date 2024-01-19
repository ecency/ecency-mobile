import { ASSET_IDS } from '../../constants/defaultAssets';
import { Referral } from '../../models';
import { CommentHistoryItem, LatestQuotes, QuoteItem, ReferralStat, Draft } from './ecency.types';

export const convertReferral = (rawData: any) => {
  return {
    _id: rawData.id || 0,
    referral: rawData.referral || '',
    referredUsername: rawData.username || '',
    isRewarded: !!rawData.rewarded,
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

export const convertDraft = (rawData: any) => {
  if (!rawData) {
    return null;
  }

  return {
    _id: rawData._id,
    title: rawData.title,
    body: rawData.body,
    tags_arr: rawData.tags_arr,
    tags: rawData.tags,
    meta: rawData.meta,
    modified: rawData.modified,
    created: rawData.created,
    timestamp: rawData.timestamp,
  } as Draft;
};

export const convertLatestQuotes = (rawData: any, currencyRate: number) => {
  return {
    [ASSET_IDS.HIVE]: convertQuoteItem(rawData.hive.quotes.usd, currencyRate),
    [ASSET_IDS.HP]: convertQuoteItem(rawData.hive.quotes.usd, currencyRate),
    [ASSET_IDS.HBD]: convertQuoteItem(rawData.hbd.quotes.usd, currencyRate),
    [ASSET_IDS.ECENCY]: convertQuoteItem(rawData.estm.quotes.usd, currencyRate),
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
