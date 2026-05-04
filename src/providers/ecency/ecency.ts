import { isArray } from 'lodash';
import * as Sentry from '@sentry/react-native';
import ecencyApi from '../../config/ecencyApi';
import { upload } from '../../config/imageApi';
import { SERVER_LIST } from '../../constants/options/api';
import { convertProposalMeta } from './converters';
import { PurchaseRequestData } from './ecency.types';

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
 * - Images: uploadImage (React Native specific - SDK uses browser File API)
 * - Accounts: deleteAccount
 * - Reporting: addReport
 * - Misc: getNodes, purchaseOrder, getActiveProposalMeta
 *
 * ================================================================================
 */

/**
 * POST /private-api/report
 *
 * For post reports: { type: 'post', author, permlink, reporter?, notes? }
 * For account reports: { type: 'account', author, reporter?, notes? }
 */
export const addReport = async (
  type: 'post' | 'account',
  author: string,
  reporter: string,
  permlink?: string,
  notes?: string,
) => {
  try {
    const body: Record<string, string> = { type, author, reporter };
    if (type === 'post' && permlink) {
      body.permlink = permlink;
    }
    if (notes) {
      body.notes = notes;
    }
    const response = await ecencyApi.post('/private-api/report', body);
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

// Old image service
/**
 * ************************************
 * IMAGES ECENCY APIS IMPLEMENTATION
 * ************************************
 */

export const uploadImage = async (media, username, sign, uploadProgress = null) => {
  try {
    const file: { uri: string; type: string; name: string; size?: number } = {
      uri: media.path,
      type: media.mime,
      name: media.filename || `img_${Math.random()}.jpg`,
    };

    const mediaSize = Number(media.size || 0);
    if (mediaSize > 0) {
      file.size = mediaSize;
    }

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
    const response = await fetch('https://ecency.com/public-nodes.json');
    if (!response.ok) {
      console.warn(`failed to get nodes list: HTTP ${response.status}, using local fallback`);
      return [...SERVER_LIST];
    }
    const data = await response.json();

    const nodes = data?.hived ?? data;

    if (!isArray(nodes) || nodes.length === 0) {
      throw new Error('Invalid data returned, fallback to local copy');
    }

    return nodes;
  } catch (error) {
    console.warn('failed to get nodes list', error);
    Sentry.captureException(error);
    return [...SERVER_LIST];
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
 * ************************************
 * POST TIPS API IMPLEMENTATION
 * ************************************
 */

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
