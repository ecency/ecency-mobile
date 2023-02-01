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
} from '../constants/constants';

export enum CommentCacheStatus {
  PENDING = 'PENDING',
  POSTPONED = 'PUBLISHED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export interface Vote {
  amount: number;
  isDownvote: boolean;
  incrementStep: number;
  votedAt: number;
  expiresAt: number;
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
  replies?:string[];
  children?:number;
  json_metadata?: any;
  isDeletable?: boolean;
  created?: string; // handle created and updated separatly
  updated?: string;
  expiresAt?: number;
  expandedReplies?: boolean;
  renderOnTop?:boolean;
  status: CommentCacheStatus;
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

export interface LastUpdateMeta {
  postPath: string;
  updatedAt: number;
  type: 'vote' | 'comment' | 'draft';
}

interface State {
  votes: Map<string, Vote>;
  commentsCollection:{ [key: string]: Comment}; // TODO: handle comment array per post, if parent is same
  draftsCollection: { [key: string]: Draft };
  claimsCollection: ClaimsCollection;
  subscribedCommunities: Map<string, SubscribedCommunity>;
  pointActivities: Map<string, PointActivity>;
  lastUpdate: LastUpdateMeta;
}

const initialState: State = {
  votes: new Map(),
  commentsCollection: {},
  draftsCollection: {},
  claimsCollection: {},
  subscribedCommunities: new Map(),
  pointActivities: new Map(),
  lastUpdate: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_VOTE_CACHE:
      if (!state.votes) {
        state.votes = new Map<string, Vote>();
      }
      state.votes.set(payload.postPath, payload.vote);
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
      state.commentsCollection = {...state.commentsCollection, [payload.commentPath]:payload.comment};
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.commentPath,
          updatedAt: new Date().getTime(),
          type: 'comment',
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

    case PURGE_EXPIRED_CACHE:
      const currentTime = new Date().getTime();

      if (state.votes && state.votes.size) {
        Array.from(state.votes).forEach((entry) => {
          if (entry[1].expiresAt < currentTime) {
            state.votes.delete(entry[0]);
          }
        });
      }

      if (state.commentsCollection) {
        for (const key in state.commentsCollection) {
          if (state.commentsCollection.hasOwnProperty(key)) {
            const draft = state.commentsCollection[key];
            if (draft && ((draft?.expiresAt || 0) < currentTime)) {
              delete state.commentsCollection[key];
            }
          }
        }
      }

      if (state.draftsCollection) {
        for (const key in state.draftsCollection) {
          if (state.draftsCollection.hasOwnProperty(key)) {
            const draft = state.draftsCollection[key];
            if (draft && ((draft?.expiresAt || 0) < currentTime || !draft.body)) {
              delete state.draftsCollection[key];
            }
          }
        }
      }

      if (state.claimsCollection) {
        for (const key in state.claimsCollection) {
          if (state.claimsCollection.hasOwnProperty(key)) {
            const claim = state.claimsCollection[key];
            if (claim && (claim?.expiresAt || 0) < currentTime) {
              delete state.claimsCollection[key];
            }
          }
        }
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
}
