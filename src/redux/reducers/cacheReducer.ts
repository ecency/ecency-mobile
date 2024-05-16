import { PointActivity } from '../../providers/ecency/ecency.types';
import {
  PURGE_EXPIRED_CACHE,
  UPDATE_VOTE_CACHE,
  UPDATE_COMMENT_CACHE,
  DELETE_COMMENT_CACHE_ENTRY,
  DELETE_DRAFT_CACHE_ENTRY,
  UPDATE_DRAFT_CACHE,
  UPDATE_SUBSCRIBED_COMMUNITY_CACHE,
  DELETE_SUBSCRIBED_COMMUNITY_CACHE,
  CLEAR_SUBSCRIBED_COMMUNITIES_CACHE,
  UPDATE_POINT_ACTIVITY_CACHE,
  DELETE_POINT_ACTIVITY_CACHE_ENTRY,
  UPDATE_CLAIM_CACHE,
  DELETE_CLAIM_CACHE_ENTRY,
  UPDATE_ANNOUNCEMENTS_META,
  UPDATE_POLL_VOTE_CACHE
} from '../constants/constants';

export enum CacheStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  POSTPONED = 'POSTPONED',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED',
}

export interface VoteCache {
  amount: number;
  isDownvote: boolean;
  rshares: number;
  percent: number;
  incrementStep: number;
  votedAt: number;
  expiresAt: number;
  status: CacheStatus;
}

export interface PollVoteCache {
  choiceNum: number;
  userHp:number;
  username: string;
  votedAt: number;
  expiresAt: number;
  status: CacheStatus;
}

export interface Comment {
  author: string;
  permlink: string;
  parent_author: string;
  parent_permlink: string;
  body?: string;
  markdownBody: string;
  author_reputation?: number;
  total_payout?: number;
  net_rshares?: number;
  active_votes?: Array<{ rshares: number; voter: string }>;
  replies?: string[];
  children?: number;
  json_metadata?: any;
  isDeletable?: boolean;
  created?: string; // handle created and updated separatly
  updated?: string;
  expiresAt?: number;
  expandedReplies?: boolean;
  renderOnTop?: boolean;
  status: CacheStatus;
  url?: string;
}

export interface Draft {
  author: string;
  body: string;
  title?: string;
  tags?: string;
  meta?: any;
  created?: number;
  updated?: number;
  expiresAt?: number;
}

export interface ClaimCache {
  rewardValue: string;
  claimedAt?: number;
  expiresAt?: number;
}

export interface ClaimsCollection {
  [key: string]: ClaimCache;
}

export interface SubscribedCommunity {
  data: Array<any>;
  expiresAt?: number;
}

export interface AnnouncementMeta {
  lastSeen: number;
  processed: boolean;
}

export interface LastUpdateMeta {
  postPath: string;
  updatedAt: number;
  type: 'vote' | 'comment' | 'draft' | 'poll-vote';
}

interface State {
  votesCollection: { [key: string]: VoteCache };
  commentsCollection: { [key: string]: Comment };
  pollVotesCollection: { [key: string]: PollVoteCache };
  draftsCollection: { [key: string]: Draft };
  claimsCollection: ClaimsCollection;
  subscribedCommunities: Map<string, SubscribedCommunity>;
  pointActivities: Map<string, PointActivity>;
  announcementsMeta: { [key: string]: AnnouncementMeta };
  lastUpdate: LastUpdateMeta;
}

const initialState: State = {
  votesCollection: {},
  commentsCollection: {},
  pollVotesCollection: {},
  draftsCollection: {},
  claimsCollection: {},
  announcementsMeta: {},
  subscribedCommunities: new Map(),
  pointActivities: new Map(),
  lastUpdate: null,
};

const cacheReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_VOTE_CACHE:
      if (!state.votesCollection) {
        state.votesCollection = {};
      }
      state.votesCollection = { ...state.votesCollection, [payload.postPath]: payload.vote };
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.postPath,
          updatedAt: new Date().getTime(),
          type: 'vote',
        },
      };

    case UPDATE_COMMENT_CACHE:
      if (!state.commentsCollection) {
        state.commentsCollection = {};
      }
      state.commentsCollection = {
        ...state.commentsCollection,
        [payload.commentPath]: payload.comment,
      };
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.commentPath,
          updatedAt: new Date().getTime(),
          type: 'comment',
        },
      };

    case UPDATE_POLL_VOTE_CACHE:
      if (!state.pollVotesCollection) {
        state.pollVotesCollection = {};
      }
      state.pollVotesCollection = { ...state.pollVotesCollection, [payload.postPath]: payload.pollVote };
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.postPath,
          updatedAt: new Date().getTime(),
          type: 'poll-vote',
        },
      };

    case DELETE_COMMENT_CACHE_ENTRY:
      if (state.commentsCollection && state.commentsCollection[payload]) {
        delete state.commentsCollection[payload];
      }
      return { ...state };

    case UPDATE_DRAFT_CACHE:
      if (!payload.id || !payload.draft) {
        return state;
      }

      if (!state.draftsCollection) {
        state.draftsCollection = {};
      }

      const curTime = new Date().getTime();
      const curDraft = state.draftsCollection[payload.id];
      const payloadDraft = payload.draft;

      payloadDraft.created = curDraft?.created || curTime;
      payloadDraft.updated = curTime;
      payloadDraft.expiresAt = curTime + 604800000; // 7 days ms

      state.draftsCollection[payload.id] = payloadDraft;
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.id,
          updatedAt: new Date().getTime(),
          type: 'draft',
        },
      };

    case DELETE_DRAFT_CACHE_ENTRY:
      if (state.draftsCollection && state.draftsCollection[payload]) {
        delete state.draftsCollection[payload];
      }
      return { ...state };

    case UPDATE_CLAIM_CACHE:
      const { assetId, rewardValue } = payload || {};
      if (!assetId || !rewardValue) {
        return state;
      }

      if (!state.claimsCollection) {
        state.claimsCollection = {};
      }

      const timestamp = new Date().getTime();

      const data: ClaimCache = {
        rewardValue,
        claimedAt: timestamp,
        expiresAt: timestamp + 180000, // 3 minutes expiry
      };

      state.claimsCollection[assetId] = data;
      return { ...state };

    case DELETE_CLAIM_CACHE_ENTRY:
      if (state.claimsCollection && state.claimsCollection[payload]) {
        delete state.claimsCollection[payload];
      }
      return { ...state };

    case UPDATE_SUBSCRIBED_COMMUNITY_CACHE:
      if (!state.subscribedCommunities) {
        state.subscribedCommunities = new Map<string, SubscribedCommunity>();
      }
      const subscribedCommunities = new Map(state.subscribedCommunities);
      subscribedCommunities.set(payload.path, payload.subscribedCommunity);
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        subscribedCommunities,
      };

    case DELETE_SUBSCRIBED_COMMUNITY_CACHE:
      if (state.subscribedCommunities && state.subscribedCommunities.has(payload)) {
        state.subscribedCommunities.delete(payload);
      }
      return { ...state };

    case CLEAR_SUBSCRIBED_COMMUNITIES_CACHE:
      state.subscribedCommunities = new Map<string, SubscribedCommunity>();

      return { ...state };

    case UPDATE_POINT_ACTIVITY_CACHE:
      if (!state.pointActivities) {
        state.pointActivities = new Map<string, PointActivity>();
      }
      state.pointActivities.set(payload.id, payload.pointActivity);
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };

    case DELETE_POINT_ACTIVITY_CACHE_ENTRY:
      if (state.pointActivities && state.pointActivities.has(payload)) {
        state.pointActivities.delete(payload);
      }
      return { ...state };

    case UPDATE_ANNOUNCEMENTS_META:
      if (!state.announcementsMeta) {
        state.announcementsMeta = {};
      }

      const _alreadyProcessed = state.announcementsMeta[payload.id]?.processed || false;

      state.announcementsMeta = {
        ...state.announcementsMeta,
        [payload.id]: {
          processed: _alreadyProcessed || payload.processed,
          lastSeen: new Date().getTime(),
        } as AnnouncementMeta,
      };
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };

    case PURGE_EXPIRED_CACHE:
      const currentTime = new Date().getTime();

      if (state.votesCollection) {
        Object.keys(state.votesCollection).forEach((key) => {
          const vote = state.votesCollection[key];
          if (vote && (vote?.expiresAt || 0) < currentTime) {
            delete state.votesCollection[key];
          }
        });
      }

      if (state.commentsCollection) {
        Object.keys(state.commentsCollection).forEach((key) => {
          const comment = state.commentsCollection[key];
          if (comment && (comment?.expiresAt || 0) < currentTime) {
            delete state.commentsCollection[key];
          }
        });
      }

      if (state.pollVotesCollection) {
        Object.keys(state.pollVotesCollection).forEach((key) => {
          const vote = state.pollVotesCollection[key];
          if (vote && (vote?.expiresAt || 0) < currentTime) {
            delete state.pollVotesCollection[key];
          }
        });
      }

      if (state.draftsCollection) {
        Object.keys(state.draftsCollection).forEach((key) => {
          const draft = state.draftsCollection[key];
          if (draft && ((draft?.expiresAt || 0) < currentTime || !draft.body)) {
            delete state.draftsCollection[key];
          }
        });
      }

      if (state.claimsCollection) {
        Object.keys(state.claimsCollection).forEach((key) => {
          const claim = state.claimsCollection[key];
          if (claim && (claim?.expiresAt || 0) < currentTime) {
            delete state.claimsCollection[key];
          }
        });
      }

      if (state.subscribedCommunities && state.subscribedCommunities.size) {
        Array.from(state.subscribedCommunities).forEach((entry) => {
          if (entry[1].expiresAt < currentTime) {
            state.subscribedCommunities.delete(entry[0]);
          }
        });
      }

      return {
        ...state,
      };
    default:
      return state;
  }
};

export default cacheReducer;
