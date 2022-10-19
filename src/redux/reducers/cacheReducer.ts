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
} from '../constants/constants';

export enum CommentCacheStatus {
  PENDING = 'PENDING',
  POSTPONED = 'PUBLISHED',
  DELETED = 'DELETED',
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
  json_metadata?: any;
  isDeletable?: boolean;
  created?: string; // handle created and updated separatly
  updated?: string;
  expiresAt?: number;
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

export interface SubscribedCommunity {
  data: Array<any>;
  expiresAt?: number;
}

interface State {
  votes: Map<string, Vote>;
  comments: Map<string, Comment>; // TODO: handle comment array per post, if parent is same
  drafts: Map<string, Draft>;
  subscribedCommunities: Map<string, SubscribedCommunity>;
  pointActivities: Map<string, PointActivity>;
  lastUpdate: {
    postPath: string;
    updatedAt: number;
    type: 'vote' | 'comment' | 'draft';
  };
}

const initialState: State = {
  votes: new Map(),
  comments: new Map(),
  drafts: new Map(),
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
      if (!state.comments) {
        state.comments = new Map<string, Comment>();
      }
      state.comments.set(payload.commentPath, payload.comment);
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.commentPath,
          updatedAt: new Date().getTime(),
          type: 'comment',
        },
      };

    case DELETE_COMMENT_CACHE_ENTRY:
      if (state.comments && state.comments.has(payload)) {
        state.comments.delete(payload);
      }
      return { ...state };

    case UPDATE_DRAFT_CACHE:
      if (!state.drafts) {
        state.drafts = new Map<string, Draft>();
      }

      const curTime = new Date().getTime();
      const curDraft = state.drafts.get(payload.id);
      const payloadDraft = payload.draft;

      payloadDraft.created = curDraft ? curDraft.created : curTime;
      payloadDraft.updated = curTime;
      payloadDraft.expiresAt = curTime + 604800000; // 7 days ms

      state.drafts.set(payload.id, payloadDraft);
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.id,
          updatedAt: new Date().getTime(),
          type: 'draft',
        },
      };

    case DELETE_DRAFT_CACHE_ENTRY:
      if (state.drafts && state.drafts.has(payload)) {
        state.drafts.delete(payload);
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

      if (state.comments && state.comments.size) {
        Array.from(state.comments).forEach((entry) => {
          if (entry[1].expiresAt < currentTime) {
            state.comments.delete(entry[0]);
          }
        });
      }

      if (state.drafts && state.drafts.size) {
        Array.from(state.drafts).forEach((entry) => {
          if (entry[1].expiresAt < currentTime || !entry[1].body) {
            state.drafts.delete(entry[0]);
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
}
