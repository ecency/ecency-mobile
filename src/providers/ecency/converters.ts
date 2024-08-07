import { ASSET_IDS } from '../../constants/defaultAssets';
import { Referral } from '../../models';
import { PollPreferredInterpretation } from '../hive/hive.types';
import {
  CommentHistoryItem,
  LatestQuotes,
  QuoteItem,
  ReferralStat,
  Draft,
  Accouncement,
  PollDraft,
  AssetsPortfolio,
} from './ecency.types';

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

export const convertDraftMeta = (rawData: any) => {
  if (!rawData) {
    return null;
  }

  const poll =
    rawData.poll &&
    ({
      title: rawData.poll.title || '',
      endTime: rawData.poll.endTime || new Date().toISOString(),
      voteChange: rawData.poll.voteChange || false,
      hideVotes: rawData.poll.hideVotes || false,
      interpretation: rawData.poll.interpretation || PollPreferredInterpretation.NUMBER_OF_VOTES,
      choices: rawData.poll.choices || ['', ''],
      maxChoicesVoted: rawData.poll.maxChoicesVoted || 1,
      filters: {
        accountAge: rawData.poll.filters?.accountAge || 100,
      },
    } as PollDraft);

  return {
    ...rawData,
    poll,
  };
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
    meta: convertDraftMeta(rawData.meta),
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

export const convertAnnouncement = (rawData: any) => {
  return {
    id: rawData.id,
    title: rawData.title,
    description: rawData.description,
    button_text: rawData.button_text,
    button_link: rawData.button_link,
    ops: rawData.ops,
    auth: rawData.auth,
  } as Accouncement;
};

export const convertPortfolio = (rawData: any) => {
  if (
    !rawData ||
    !rawData.marketData ||
    !rawData.globalProps ||
    !rawData.accountData ||
    !rawData.pointsData
  ) {
    return null;
  }

  return {
    globalProps: rawData.globalProps,
    marketData: rawData.marketData,
    accountData: rawData.accountData,
    pointsData: rawData.pointsData,
    engineData: rawData.engineData,
    spkData: rawData.spkData,
  } as AssetsPortfolio;
};
