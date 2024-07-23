import { isArray } from 'lodash';
import bugsnagInstance from '../../config/bugsnag';
import ecencyApi from '../../config/ecencyApi';
import { upload } from '../../config/imageApi';
import serverList from '../../config/serverListApi';
import { SERVER_LIST } from '../../constants/options/api';
import { parsePost } from '../../utils/postParser';
import {
  convertAnnouncement,
  convertCommentHistory,
  convertDraft,
  convertLatestQuotes,
  convertReferral,
  convertReferralStat,
} from './converters';
import {
  CommentHistoryItem,
  LatestMarketPrices,
  MediaItem,
  NotificationFilters,
  PurchaseRequestData,
  ReceivedVestingShare,
  Referral,
  ReferralStat,
  Snippet,
} from './ecency.types';

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
      bugsnagInstance.notify(err);
      // TODO: save currency rate of offline values
      return 1;
    });

export const getLatestQuotes = async (currencyRate: number): Promise<LatestMarketPrices> => {
  try {
    console.log('using currency rate', currencyRate);
    const res = await ecencyApi.get('/private-api/market-data/latest');

    if (!res.data) {
      throw new Error('No quote data returned');
    }

    const data = convertLatestQuotes(res.data, currencyRate);
    console.log('parsed quotes data', data, currencyRate);

    // TODO fetch engine quotes here

    return data;
  } catch (error) {
    bugsnagInstance.notify(error);
    console.warn(error);
    throw error;
  }
};

export const getCurrencyTokenRate = (currency, token) =>
  ecencyApi
    .get(`/private-api/market-data/${currency}/${token}`)
    .then((resp) => resp.data)
    .catch((err) => {
      bugsnagInstance.notify(err);
      return 0;
    });

export const getReceivedVestingShares = async (
  username: string,
): Promise<ReceivedVestingShare[]> => {
  try {
    const res = await ecencyApi.get(`/private-api/received-vesting/${username}`);
    console.log('Vesting Shares User', username, res.data);
    if (!res.data || !res.data.list) {
      throw new Error('No vesting shares for user');
    }
    return res.data.list;
  } catch (error) {
    bugsnagInstance.notify(error);
    console.warn(error);
    throw error;
  }
};

/**
 * returns list of saved drafts on ecency server
 */
export const getDrafts = async () => {
  try {
    const res = await ecencyApi.post('/private-api/drafts');
    const rawData = res.data;

    if (!rawData) {
      return [];
    }

    const _retData = rawData.length > 0 ? rawData.map(convertDraft) : [];
    return _retData;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * @params draftId
 */
export const deleteDraft = async (draftId: string) => {
  try {
    const data = { id: draftId };
    const res = await ecencyApi.post('/private-api/drafts-delete', data);
    const rawData = res.data;

    if (!rawData) {
      throw new Error('Invalid response, drafts data not returned');
    }

    const _retData = rawData.length > 0 ? rawData.map(convertDraft) : [];
    return _retData;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * @param draft
 */
export const addDraft = async (draft: any) => {
  const { title, body, tags, meta } = draft;
  try {
    const newDraft = { title, body, tags, meta };
    const res = await ecencyApi.post('/private-api/drafts-add', newDraft);
    const rawData = res.data?.drafts;

    if (!rawData) {
      throw new Error('Invalid response, drafts data not returned');
    }

    const data = rawData.length > 0 ? rawData.map(convertDraft) : [];

    return data;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * @params draftId
 * @params title
 * @params body
 * @params tags
 * @params meta
 */
export const updateDraft = async (
  draftId: string,
  title: string,
  body: string,
  tags: string,
  meta: any,
) => {
  try {
    const data = { id: draftId, title, body, tags, meta };
    const res = await ecencyApi.post('/private-api/drafts-update', data);
    if (res.data) {
      return res.data;
    } else {
      throw new Error('No data returned in response');
    }
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * ************************************
 * BOOKMARKS ECENCY APIS IMPLEMENTATION
 * ************************************
 */

/**
 * Adds post to user's bookmarks
 * @param author
 * @param permlink
 * @returns array of saved bookmarks
 */
export const addBookmark = async (author: string, permlink: string) => {
  try {
    const data = { author, permlink };
    const response = await ecencyApi.post('/private-api/bookmarks-add', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to add bookmark', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * fetches saved bookmarks of user
 * @returns array of saved bookmarks
 */
export const getBookmarks = async () => {
  try {
    const response = await ecencyApi.post('/private-api/bookmarks');
    return response.data;
  } catch (error) {
    console.warn('Failed to get saved bookmarks', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Deletes bookmark from user's saved bookmarks
 * @params bookmarkId
 * @returns array of saved bookmarks
 */
export const deleteBookmark = async (bookmarkId: string) => {
  try {
    const data = { id: bookmarkId };
    const response = await ecencyApi.post('/private-api/bookmarks-delete', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to delete bookmark', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * TOOD:
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
    bugsnagInstance.notify(err);
    throw err;
  }
};

/**
 * TOOD:
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
    bugsnagInstance.notify(err);
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
    bugsnagInstance.notify(error);
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
    bugsnagInstance.notify(error);
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
    bugsnagInstance.notify(error);
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
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * ************************************
 * SNIPPETS ECENCY APIS IMPLEMENTATION
 * ************************************
 */

/**
 * Fetches all saved user fragments/snippets from ecency
 * @returns array of fragments
 */
export const getFragments = async () => {
  try {
    const response = await ecencyApi.post('/private-api/fragments');
    return response.data as Snippet[];
  } catch (error) {
    console.warn('Failed to get fragments', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Adds new fragment/snippets to user's saved fragments/snippets
 * @params title title
 * @params body body
 * @returns array of fragments
 */

export const addFragment = async (title: string, body: string) => {
  try {
    const data = { title, body };
    const response = await ecencyApi.post('/private-api/fragments-add', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to add fragment', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Updates a fragment content using fragment id
 * @params fragmentId
 * @params title
 * @params body
 * @returns array of fragments
 */
export const updateFragment = async (fragmentId: string, title: string, body: string) => {
  try {
    const data = { id: fragmentId, title, body };
    const response = await ecencyApi.post('/private-api/fragments-update', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to update fragment', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Deletes user saved fragment using specified fragment id
 * @params fragmentId
 * @returns array of fragments
 */
export const deleteFragment = async (fragmentId: string) => {
  try {
    const data = { id: fragmentId };
    const response = await ecencyApi.post('/private-api/fragments-delete', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to delete fragment', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * ************************************
 * ACTIVITES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

export const getLeaderboard = async (duration: 'day' | 'week' | 'month') => {
  try {
    const response = await ecencyApi.get(`private-api/leaderboard/${duration}`);

    const rawData = response.data;
    if (!rawData || !isArray(rawData)) {
      throw new Error('Invalid response returned');
    }
    return rawData;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * fetches notifications from ecency server using filter and since props
 * @param data optional filter and since props;
 * @returns array of notifications
 */
export const getNotifications = async (data: {
  filter?: NotificationFilters;
  since?: string;
  limit?: number;
}) => {
  try {
    const response = await ecencyApi.post('/private-api/notifications', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to get notifications', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

export const getUnreadNotificationCount = async (accessToken?: string) => {
  try {
    const data = accessToken ? { code: accessToken } : {};
    const response = await ecencyApi.post('/private-api/notifications/unread', data);
    return response.data ? response.data.count : 0;
  } catch (error) {
    bugsnagInstance.notify(error);
    return 0;
  }
};

export const markNotifications = async (id: string | null = null) => {
  try {
    const data = id ? { id } : {};
    const response = await ecencyApi.post('/private-api/notifications/mark', data);
    return response.data;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

export const setPushToken = async (data, accessToken = null) => {
  try {
    if (!data.username) {
      console.log('skipping push token setting, as no user is provided');
      return;
    }

    if (accessToken) {
      data.code = accessToken;
    }

    const res = await await ecencyApi.post('/private-api/register-device', data);
    return res.data;
  } catch (error) {
    console.warn('Failed to set push token on server');
    bugsnagInstance.notify(error);
  }
};

/**
 * ************************************
 * SEARCH ECENCY APIS IMPLEMENTATION
 * ************************************
 */

export const search = async (data: {
  q: string;
  sort: string;
  hideLow: string;
  since?: string;
  scroll_id?: string;
}) => {
  try {
    const response = await ecencyApi.post('/search-api/search', data);
    return response.data;
  } catch (error) {
    console.warn('Search failed', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

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
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 *
 * @param q query
 * @param limit number of posts to fetch
 * @param random random
 * @returns array of accounts
 */
export const searchAccount = async (q = '', limit = 20, random = 0) => {
  try {
    const data = {
      q,
      limit,
      random,
    };
    const response = await ecencyApi.post('/search-api/search-account', data);
    return response.data;
  } catch (error) {
    console.warn('account search failed', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 *
 * @param q query
 * @param limit number of posts to fetch
 * @param random random
 * @returns array of accounts
 */
export const searchTag = async (q = '', limit = 20, random = 0) => {
  try {
    const data = {
      q,
      limit,
      random,
    };
    const response = await ecencyApi.post('/search-api/search-tag', data);
    return response.data;
  } catch (error) {
    console.warn('tag search failed', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * ************************************
 * SCHEDULES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

/**
 * Adds new post to scheduled posts
 * @param permlink
 * @param title
 * @param body
 * @param meta
 * @param options
 * @param scheduleDate
 * @returns All scheduled posts
 */
export const addSchedule = async (
  permlink: string,
  title: string,
  body: string,
  meta: any,
  options: any,
  scheduleDate: string,
) => {
  try {
    const data = {
      title,
      permlink,
      meta,
      body,
      schedule: scheduleDate,
      options,
      reblog: 0,
    };
    const response = await ecencyApi.post('/private-api/schedules-add', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to add post to schedule', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Fetches all scheduled posts against current user
 * @returns array of app scheduled posts
 */
export const getSchedules = async () => {
  try {
    const response = await ecencyApi.post('/private-api/schedules');
    return response.data || [];
  } catch (error) {
    console.warn('Failed to get schedules');
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Removes post from scheduled posts using post id;
 * @param id
 * @returns array of scheduled posts
 */
export const deleteScheduledPost = async (id: string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post('/private-api/schedules-delete', data);
    return response.data || [];
  } catch (error) {
    console.warn('Failed to delete scheduled post');
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * Moves scheduled post to draft using schedule id
 * @param id
 * @returns Array of scheduled posts
 */
export const moveScheduledToDraft = async (id: string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post('/private-api/schedules-move', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to move scheduled post to drafts');
    bugsnagInstance.notify(error);
    throw error;
  }
};

// Old image service
/**
 * ************************************
 * IMAGES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

export const getImages = async () => {
  try {
    const response = await ecencyApi.post('/private-api/images');
    return response.data;
  } catch (error) {
    console.warn('Failed to get images', error);
    bugsnagInstance.notify(error);
  }
};

export const addImage = async (url: string) => {
  try {
    const data = { url };
    const response = await ecencyApi.post('/private-api/images-add', data);
    return response.data as MediaItem[];
  } catch (error) {
    console.warn('Failed to add image', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

export const deleteImage = async (id: string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post('/private-api/images-delete', data);
    return response.data;
  } catch (error) {
    console.warn('Failed to delete image', error);
    bugsnagInstance.notify(error);
    throw error;
  }
};

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
    console.log('nodes response', response.data);

    if (!response.data?.hived) {
      throw new Error('Invalid data returned, fallback to local copy');
    }

    return response.data?.hived;
  } catch (error) {
    console.warn('failed to get nodes list', error);
    bugsnagInstance.notify(error);
    return SERVER_LIST;
  }
};

/**
 * refreshes access token using refresh token
 * @param code refresh token
 * @returns scToken (includes accessToken as property)
 */
export const getSCAccessToken = async (code: string) => {
  try {
    const response = await ecencyApi.post('/auth-api/hs-token-refresh', {
      code,
    });
    return response.data;
  } catch (error) {
    console.warn('failed to refresh token');
    bugsnagInstance.notify(error);
    throw error;
  }
};

/**
 * fetches promoted posts for tab content
 * @param username for parsing post data
 * @returns array of promoted posts
 */
export const getPromotedEntries = async (username: string) => {
  try {
    console.log('Fetching promoted entries');
    return ecencyApi.get('/private-api/promoted-entries').then((resp) => {
      return resp.data.map((post_data: any) =>
        post_data ? parsePost(post_data, username, true) : null,
      );
    });
  } catch (error) {
    console.warn('Failed to get promoted enties');
    bugsnagInstance.notify(error);
    return error;
  }
};

/**
 * fetches boost plus prices
 * @returns array of prices
 */
export const getBoostPlusPrice = async () => {
  try {
    console.log('Fetching boost plus prices');
    return ecencyApi.post('/private-api/boost-plus-price').then((resp) => {
      return resp.data;
    });
  } catch (error) {
    console.warn('Failed to get boost plus prices');
    bugsnagInstance.notify(error);
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
    console.log('Fetching boosted plus account');
    return ecencyApi.post('/private-api/boosted-plus-account', data).then((resp) => {
      return resp.data;
    });
  } catch (error) {
    console.warn('Failed to get boost plus prices');
    bugsnagInstance.notify(error);
    return error;
  }
};

/**
* TOOD:
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
//   .catch((error) => bugsnagInstance.notify(error));

export const purchaseOrder = async (data: PurchaseRequestData) => {
  try {
    const response = await ecencyApi.post('/private-api/purchase-order', data);
    return response.data;
  } catch (error) {
    bugsnagInstance.notify(error);
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
    bugsnagInstance.notify(error);
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
    console.log('Referrals List', username, res.data);
    if (!res.data) {
      throw new Error('No Referrals for this user!');
    }
    const referralsList =
      res.data.length > 0 ? res.data.map((referralItem: any) => convertReferral(referralItem)) : [];
    return referralsList;
  } catch (error) {
    bugsnagInstance.notify(error);
    console.warn(error);
    throw error;
  }
};

export const getReferralsStats = async (username: string): Promise<ReferralStat> => {
  try {
    const res = await ecencyApi.get(`/private-api/referrals/${username}/stats`);
    console.log('Referrals Stats', username, res.data);
    if (!res.data) {
      throw new Error('No Referrals for this user!');
    }
    return convertReferralStat(res.data);
  } catch (error) {
    bugsnagInstance.notify(error);
    console.warn(error);
    throw error;
  }
};

/**
 * ************************************
 * EDIT HISTORY API IMPLEMENTATION
 * ************************************
 */

export const getCommentHistory = async (
  author: string,
  permlink: string,
): Promise<CommentHistoryItem[]> => {
  try {
    const data = {
      author,
      permlink,
    };
    const res = await ecencyApi.post('/private-api/comment-history', data);
    console.log('comment history', res.data);
    if (!res.data) {
      throw new Error('No history data!');
    }
    return res?.data?.list.map((item) => convertCommentHistory(item));
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};

export const getAnnouncements = async (accessToken: string) => {
  try {
    const params = accessToken ? { code: accessToken } : null;

    const res = await ecencyApi.get('/private-api/announcements', { params });
    console.log('announcements fetcehd', res.data);
    if (!res.data) {
      throw new Error('No announcements found!');
    }
    return res?.data.map(convertAnnouncement);
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};


export const getPortfolio = async (username: string) => {
  try {

    if(!username){
      throw new Error("Username must be passed for fethcing portfolio");
    }

    const res = await ecencyApi.post('/wallet-api/portfolio', { username });
    console.log('portflio fetched', res.data);

    if (!res.data) {
      throw new Error('portfolio data not fetched!');
    }

    return res?.data;
    
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};
