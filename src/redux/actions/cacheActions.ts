import { renderPostBody } from '@ecency/render-helper';
import { Platform } from 'react-native';
import { PointActivity } from '../../providers/ecency/ecency.types';
import { makeJsonMetadataReply } from '../../utils/editor';
import {
  UPDATE_VOTE_CACHE,
  PURGE_EXPIRED_CACHE,
  UPDATE_COMMENT_CACHE,
  DELETE_COMMENT_CACHE_ENTRY,
  UPDATE_DRAFT_CACHE,
  DELETE_DRAFT_CACHE_ENTRY,
  UPDATE_SUBSCRIBED_COMMUNITY_CACHE,
  DELETE_SUBSCRIBED_COMMUNITY_CACHE,
  CLEAR_SUBSCRIBED_COMMUNITIES_CACHE,
  DELETE_POINT_ACTIVITY_CACHE_ENTRY,
  UPDATE_POINT_ACTIVITY_CACHE,
  UPDATE_CLAIM_CACHE,
  DELETE_CLAIM_CACHE_ENTRY,
} from '../constants/constants';
import {
  Comment,
  CacheStatus,
  Draft,
  SubscribedCommunity,
  VoteCache,
} from '../reducers/cacheReducer';

export const updateVoteCache = (postPath: string, vote: VoteCache) => ({
  payload: {
    postPath,
    vote,
  },
  type: UPDATE_VOTE_CACHE,
});

interface CommentCacheOptions {
  isUpdate?: boolean;
  parentTags?: Array<string>;
}

export const updateCommentCache = (
  commentPath: string,
  comment: Comment,
  options: CommentCacheOptions = { isUpdate: false },
) => {
  console.log('body received:', comment.markdownBody);
  const updated = new Date();
  updated.setSeconds(updated.getSeconds() - 5); // make cache delayed by 5 seconds to avoid same updated stamp in post data
  const updatedStamp = updated.toISOString().substring(0, 19); // server only return 19 character time string without timezone part

  if (options.isUpdate && !comment.created) {
    throw new Error(
      'For comment update, created prop must be provided from original comment data to update local cache',
    );
  }

  if (!options.parentTags && !comment.json_metadata) {
    throw new Error(
      'either of json_metadata in comment data or parentTags in options must be provided',
    );
  }

  comment.created = comment.created || updatedStamp; // created will be set only once for new comment;
  comment.updated = comment.updated || updatedStamp;
  comment.expiresAt = comment.expiresAt || updated.getTime() + 6000000; // 600000;
  comment.active_votes = comment.active_votes || [];
  comment.net_rshares = comment.net_rshares || 0;
  comment.author_reputation = comment.author_reputation || 25;
  comment.total_payout = comment.total_payout || 0;
  comment.json_metadata = comment.json_metadata || makeJsonMetadataReply(options.parentTags);
  comment.children = 0;
  comment.replies = [];
  comment.isDeletable = comment.isDeletable || true;
  comment.status = comment.status || CacheStatus.PENDING;

  comment.body = renderPostBody(
    {
      author: comment.author,
      permlink: comment.permlink,
      last_update: comment.updated,
      body: comment.markdownBody,
    },
    true,
    Platform.OS === 'android',
  );

  return {
    payload: {
      commentPath,
      comment,
    },
    type: UPDATE_COMMENT_CACHE,
  };
};

export const deleteCommentCacheEntry = (commentPath: string) => ({
  payload: commentPath,
  type: DELETE_COMMENT_CACHE_ENTRY,
});

export const updateDraftCache = (id: string, draft: Draft) => ({
  payload: {
    id,
    draft,
  },
  type: UPDATE_DRAFT_CACHE,
});

export const deleteDraftCacheEntry = (id: string) => ({
  payload: id,
  type: DELETE_DRAFT_CACHE_ENTRY,
});

export const updateClaimCache = (assetId: string, rewardValue: string) => ({
  payload: {
    assetId,
    rewardValue,
  },
  type: UPDATE_CLAIM_CACHE,
});

export const updateSubscribedCommunitiesCache = (data: any) => {
  const path = data.communityId;
  const created = new Date();
  const communityTitle = data.communityTitle ? data.communityTitle : '';
  const userRole = data.userRole ? data.userRole : '';
  const userLabel = data.userLabel ? data.userLabel : '';

  const subscribedCommunity: SubscribedCommunity = {
    data: [data.communityId, communityTitle, userRole, userLabel, !data.isSubscribed],
    expiresAt: created.getTime() + 86400000,
  };

  return {
    payload: {
      path,
      subscribedCommunity,
    },
    type: UPDATE_SUBSCRIBED_COMMUNITY_CACHE,
  };
};

export const deleteClaimCacheEntry = (assetId: string) => ({
  payload: assetId,
  type: DELETE_CLAIM_CACHE_ENTRY,
});

export const deleteSubscribedCommunityCacheEntry = (path: string) => ({
  payload: path,
  type: DELETE_SUBSCRIBED_COMMUNITY_CACHE,
});

export const clearSubscribedCommunitiesCache = () => ({
  type: CLEAR_SUBSCRIBED_COMMUNITIES_CACHE,
});

export const updatePointActivityCache = (id: string, pointActivity: PointActivity) => ({
  payload: {
    id,
    pointActivity,
  },
  type: UPDATE_POINT_ACTIVITY_CACHE,
});

export const deletePointActivityCache = (id: string) => ({
  payload: id,
  type: DELETE_POINT_ACTIVITY_CACHE_ENTRY,
});

export const purgeExpiredCache = () => ({
  type: PURGE_EXPIRED_CACHE,
});
