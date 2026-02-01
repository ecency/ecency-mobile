import { isArray } from 'lodash';
import * as Sentry from '@sentry/react-native';
import ecencyApi from '../../config/ecencyApi';
import { upload } from '../../config/imageApi';
import serverList from '../../config/serverListApi';
import { SERVER_LIST } from '../../constants/options/api';
import {
  convertLatestQuotes,
  convertProposalMeta,
  convertReferral,
  convertReferralStat,
} from './converters';
import { LatestMarketPrices, PurchaseRequestData, Referral, ReferralStat } from './ecency.types';
import { delay } from '../../utils/editor';

/**
 * ================================================================================
 * ECENCY API - MOBILE-SPECIFIC FUNCTIONS
 * ================================================================================
 *
 * This file contains Ecency API functions that are mobile-specific or not yet
 * available in @ecency/sdk. Most query/mutation operations have been migrated
 * to SDK - use SDK versions when available.
 *
 * MIGRATED TO SDK (removed from this file):
 * - Queries: getReceivedVestingShares, getLeaderboard, getCommentHistory
 * - Search: search, searchAccount, searchTag
 * - Drafts: getDrafts, addDraft, updateDraft -> SDK draft mutations
 * - Schedules: addSchedule, getSchedules, deleteScheduledPost, moveScheduledToDraft
 * - Bookmarks: addBookmark, getBookmarks, deleteBookmark -> useAddBookmark, useDeleteBookmark
 * - Notifications: getUnreadNotificationCount, getNotifications, markNotifications -> SDK notification queries/mutations
 * - Images: getImages, addImage, deleteImage -> SDK image mutations
 * - Snippets/Fragments: getFragments, addFragment, updateFragment, deleteFragment -> SDK fragment mutations
 * - Portfolio: getPortfolio -> getPortfolioQueryOptions
 * - Tips: getPostTips -> getPostTipsQueryOptions
 * - Announcements: getAnnouncements -> getAnnouncementsQueryOptions
 * - Promotions: getPromotedEntries -> getPromotedPostsQuery
 *
 * STILL IN THIS FILE (mobile-specific or not in SDK):
 * - Currency APIs: getFiatHbdRate, getLatestQuotes, getCurrencyTokenRate
 * - Images: uploadImage (React Native specific - SDK uses browser File API)
 * - Notifications: setPushToken (device registration)
 * - Accounts: deleteAccount, signUp
 * - Reporting: addReport
 * - Search: searchPath (path search for boost/promote)
 * - Misc: getNodes, purchaseOrder, getSCAccessToken, getBotAuthers, getActiveProposalMeta
 *
 * TODO - Can be migrated to SDK (but still used by old code):
 * - Favorites: checkFavorite, addFavorite, deleteFavorite -> getFavouritesQueryOptions, useAccountFavouriteAdd, useAccountFavouriteDelete
 * - Referrals: getReferralsList, getReferralsStats -> getReferralsInfiniteQueryOptions, getReferralsStatsQueryOptions
 * - Boost: getBoostPlusAccount, getBoostPlusPrice -> getBoostPlusAccountPricesQueryOptions, getBoostPlusPricesQueryOptions
 *
 * ================================================================================
 */

/**
 * ************************************
 * CURRENCY APIS IMPLEMENTATION
 * ************************************
 */

export const getFiatHbdRate = (fiatCode: string) =>
  ecencyApi
    .get(`/private-api/market-data/${fiatCode}/hbd`)
    .then((resp) => resp.data)
    .catch((err) => {
      Sentry.captureException(err);
      // TODO: save currency rate of offline values
      return 1;
    });

export const getLatestQuotes = async (currencyRate: number): Promise<LatestMarketPrices> => {
  try {
    const res = await ecencyApi.get('/private-api/market-data/latest');

    if (!res.data) {
      throw new Error('No quote data returned');
    }

    const data = convertLatestQuotes(res.data, currencyRate);

    // TODO fetch engine quotes here

    return data;
  } catch (error) {
    Sentry.captureException(error);
    console.warn(error);
    throw error;
  }
};

export const getCurrencyTokenRate = (currency, token) =>
  ecencyApi
    .get(`/private-api/market-data/${currency}/${token}`)
    .then((resp) => resp.data)
    .catch((err) => {
      Sentry.captureException(err);
      return 0;
    });

/**
 * TODO:
 * POST /private-api/report
 *
 * body:
 * type:string
 * data:string
 *
 * */
export const addReport = async (type: 'content' | 'user', data: string) => {
  try {
    const response = await ecencyApi.post('/private-api/report', {
      type,
      data,
    });
    return response.data;
  } catch (err) {
    console.warn('Failed to report to ecency');
    Sentry.captureException(err);
    throw err;
  }
};

/**
 * TODO:
 * POST /private-api/request-delete
 *
 * body:
 * username:string
 * data:string
 *
 * */
export const deleteAccount = async (username: string, data: string) => {
  try {
    const response = await ecencyApi.post('/private-api/request-delete', {
      username,
      data,
    });
    return response.data;
  } catch (err) {
    console.warn('Failed to report to ecency');
    Sentry.captureException(err);
    throw err;
  }
};

/**
 * ************************************
 * FAVOURITES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

/**
 * Fetches user favourites
 * @returns array of favourite accounts
 */
export const getFavorites = async () => {
  try {
    const response = await ecencyApi.post('/private-api/favorites');
    return response.data;
  } catch (error) {
    console.warn('Failed to get favorites', error);
    Sentry.captureException(error);
    throw error;
  }
};

/**
 * Checks if user is precent in current user's favourites
 * @params targetUsername username
 * @returns boolean
 */
export const checkFavorite = async (targetUsername: string) => {
  try {
    const data = { account: targetUsername };
    const response = await ecencyApi.post('/private-api/favorites-check', data);
    return response.data || false;
  } catch (error) {
    console.warn('Failed to check favorite', error);
    Sentry.captureException(error);
  }
};

/**
 * Adds taget user to current user's favourites
 * @params target username
 * @returns array of user favourites
 */
export const addFavorite = async (targetUsername: string) => {
  try {
    const data = { account: targetUsername };
    const response = await ecencyApi.post('/private-api/favorites-add', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to add user favorites', error);
    Sentry.captureException(error);
    throw error;
  }
};

/**
 * Removes taget user to current user's favourites
 * @params target username
 * @returns array of user favourites
 */
export const deleteFavorite = async (targetUsername: string) => {
  try {
    const data = { account: targetUsername };
    const response = await ecencyApi.post('/private-api/favorites-delete', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to add user favorites', error);
    Sentry.captureException(error);
    throw error;
  }
};

/**
 * ************************************
 * ACTIVITES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

export const setPushToken = async (data, accessToken = null) => {
  try {
    if (!data.username) {
      console.warn('skipping push token setting, as no user is provided');
      return;
    }

    if (accessToken) {
      data.code = accessToken;
    }

    const res = await ecencyApi.post('/private-api/register-device', data);
    return res.data;
  } catch (error) {
    console.warn('Failed to set push token on server');
    Sentry.captureException(error);
  }
};

/**
 * ************************************
 * SEARCH ECENCY APIS IMPLEMENTATION
 * ************************************
 */

/**
 *
 * @param q query
 * @returns array of path strings
 */
export const searchPath = async (q: string) => {
  try {
    const data = { q };
    const response = await ecencyApi.post('/search-api/search-path', data);
    return response.data;
  } catch (error) {
    console.warn('path search failed', error);
    Sentry.captureException(error);
    throw error;
  }
};

// Old image service
/**
 * ************************************
 * IMAGES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

export const uploadImage = async (media, username, sign, uploadProgress = null) => {
  try {
    const file = {
      uri: media.path,
      type: media.mime,
      name: media.filename || `img_${Math.random()}.jpg`,
      size: media.size,
    };

    const fData = new FormData();
    fData.append('file', file);

    const res = await upload(fData, username, sign, uploadProgress);
    if (!res || !res.data) {
      throw new Error('Returning response missing media data');
    }
    return res.data;
  } catch (error) {
    console.warn('Image upload failed', error);
    throw error;
  }
};

// New image service

export const getNodes = async () => {
  try {
    const response = await serverList.get('');

    const nodes = response.data?.hived ?? response.data;

    if (!isArray(nodes) || nodes.length === 0) {
      throw new Error('Invalid data returned, fallback to local copy');
    }

    return nodes;
  } catch (error) {
    console.warn('failed to get nodes list', error);
    Sentry.captureException(error);
    return SERVER_LIST;
  }
};

/**
 * refreshes access token using refresh token
 * @param code refresh token
 * @returns scToken (includes accessToken as property)
 */
export const getSCAccessToken = async (
  code: string,
  retriesCount = 3,
  _delayMs = 200,
): Promise<any> => {
  try {
    const response = await ecencyApi.post('/auth-api/hs-token-refresh', {
      code,
    });
    return response.data;
  } catch (error) {
    if (retriesCount > 0) {
      await delay(_delayMs);
      return getSCAccessToken(code, retriesCount - 1, _delayMs * 2);
    } else {
      console.warn('failed to refresh token');
      Sentry.captureException(error);
      throw error;
    }
  }
};

/**
 * fetches boost plus prices
 * @returns array of prices
 */
export const getBoostPlusPrice = async () => {
  try {
    return ecencyApi.post('/private-api/boost-plus-price').then((resp) => {
      return resp.data;
    });
  } catch (error) {
    console.warn('Failed to get boost plus prices');
    Sentry.captureException(error);
    return error;
  }
};

/**
 * fetches boost plus account
 * @param account for knowing if already boosted
 * @returns array
 */
export const getBoostPlusAccount = async (account: string) => {
  const data = {
    account,
  };
  try {
    return ecencyApi.post('/private-api/boosted-plus-account', data).then((resp) => {
      return resp.data;
    });
  } catch (error) {
    console.warn('Failed to get boost plus prices');
    Sentry.captureException(error);
    return error;
  }
};

/**
* TODO:
* POST /private-api/purchase-order
*
* body:
* platform:string
* product:string
* receipt:string
* user:string

NOTE: data or type PurchaseRequestData should contain body, pass as it is
* */

/**
 * post inapp purchase method to call
 * @param data PurchaseRequestData
 * @returns
 * */

// api
//   .post('/purchase-order', data)
//   .then((resp) => resp.data)
//   .catch((error) => Sentry.captureException(error));

export const purchaseOrder = async (data: PurchaseRequestData) => {
  try {
    const response = await ecencyApi.post('/private-api/purchase-order', data);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

/**
 * Registers new user with ecency and hive, on confirmation sends
 * details to user email
 * @param username for new user
 * @param email of new user
 * @param referral username
 * @returns boolean success flag
 */
export const signUp = async (username: string, email: string, referral?: string) => {
  try {
    const data = {
      username,
      email,
      referral,
    };
    const response = await ecencyApi.post('/private-api/account-create', data);
    return response.status === 202;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

/**
 * ************************************
 * REFERRAL API IMPLEMENTATION
 * ************************************
 */

export const getReferralsList = async (
  username: string,
  maxId: number | undefined,
): Promise<Referral[]> => {
  try {
    const res = await ecencyApi.get(`/private-api/referrals/${username}`, {
      params: {
        max_id: maxId,
      },
    });
    if (!res.data) {
      throw new Error('No Referrals for this user!');
    }
    const referralsList =
      res.data.length > 0 ? res.data.map((referralItem: any) => convertReferral(referralItem)) : [];
    return referralsList;
  } catch (error) {
    Sentry.captureException(error);
    console.warn(error);
    throw error;
  }
};

export const getReferralsStats = async (username: string): Promise<ReferralStat> => {
  try {
    const res = await ecencyApi.get(`/private-api/referrals/${username}/stats`);
    if (!res.data) {
      throw new Error('No Referrals for this user!');
    }
    return convertReferralStat(res.data);
  } catch (error) {
    Sentry.captureException(error);
    console.warn(error);
    throw error;
  }
};

/**
 * ************************************
 * POST TIPS API IMPLEMENTATION
 * ************************************
 */

export const getBotAuthers = async () => {
  try {
    const res = await ecencyApi.get('/private-api/public/bots');
    const { data } = res;

    if (!data || !isArray(data)) {
      throw new Error('invalid bot authers data');
    }

    return data as string[];
  } catch (error) {
    Sentry.captureException(error);
    return [] as string[];
  }
};

// get active proposal meta api call
export const getActiveProposalMeta = async () => {
  try {
    const res = await ecencyApi.get('/private-api/proposal/active');

    const data = convertProposalMeta(res.data);

    if (!data) {
      throw new Error('invalid proposal data');
    }

    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
