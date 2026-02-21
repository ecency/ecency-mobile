import { PointActivity } from '../../providers/ecency/ecency.types';
import {
  UPDATE_VOTE_CACHE,
  PURGE_EXPIRED_CACHE,
  UPDATE_DRAFT_CACHE,
  DELETE_DRAFT_CACHE_ENTRY,
  UPDATE_REPLY_CACHE,
  DELETE_REPLY_CACHE_ENTRY,
  UPDATE_SUBSCRIBED_COMMUNITY_CACHE,
  DELETE_SUBSCRIBED_COMMUNITY_CACHE,
  CLEAR_SUBSCRIBED_COMMUNITIES_CACHE,
  DELETE_POINT_ACTIVITY_CACHE_ENTRY,
  UPDATE_POINT_ACTIVITY_CACHE,
  UPDATE_CLAIM_CACHE,
  DELETE_CLAIM_CACHE_ENTRY,
  UPDATE_ANNOUNCEMENTS_META,
  UPDATE_POLL_VOTE_CACHE,
  UPDATE_PROPOSALS_VOTE_META,
} from '../constants/constants';
import { Draft, SubscribedCommunity, VoteCache, PollVoteCache } from '../reducers/cacheReducer';

export const updateVoteCache = (postPath: string, vote: VoteCache) => ({
  payload: {
    postPath,
    vote,
  },
  type: UPDATE_VOTE_CACHE,
});

export const updatePollVoteCache = (postPath: string, pollVote: PollVoteCache) => ({
  payload: {
    postPath,
    pollVote,
  },
  type: UPDATE_POLL_VOTE_CACHE,
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

export const updateReplyCache = (id: string, draft: Draft) => ({
  payload: {
    id,
    draft,
  },
  type: UPDATE_REPLY_CACHE,
});

export const deleteReplyCacheEntry = (id: string) => ({
  payload: id,
  type: DELETE_REPLY_CACHE_ENTRY,
});

export const updateClaimCache = (assetId: string, rewardValue: number) => ({
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

export const updateAnnoucementsMeta = (id: string, processed: boolean) => ({
  payload: {
    id,
    processed,
  },
  type: UPDATE_ANNOUNCEMENTS_META,
});

/**
 *
 * @param id proposalId
 * @param username
 * @param processed
 * @returns
 */
export const updateProposalVoteMeta = (
  id: number,
  username: string,
  processed: boolean,
  dismissedAt = 0,
) => ({
  payload: {
    id: `${id}_${username}`,
    processed,
    dismissedAt,
  },
  type: UPDATE_PROPOSALS_VOTE_META,
});

export const purgeExpiredCache = () => ({
  type: PURGE_EXPIRED_CACHE,
});
