import { PointActivity } from '../../providers/ecency/ecency.types';
import {
  PURGE_EXPIRED_CACHE,
  UPDATE_VOTE_CACHE,
  DELETE_DRAFT_CACHE_ENTRY,
  UPDATE_DRAFT_CACHE,
  UPDATE_REPLY_CACHE,
  DELETE_REPLY_CACHE_ENTRY,
  UPDATE_SUBSCRIBED_COMMUNITY_CACHE,
  DELETE_SUBSCRIBED_COMMUNITY_CACHE,
  CLEAR_SUBSCRIBED_COMMUNITIES_CACHE,
  UPDATE_POINT_ACTIVITY_CACHE,
  DELETE_POINT_ACTIVITY_CACHE_ENTRY,
  UPDATE_CLAIM_CACHE,
  DELETE_CLAIM_CACHE_ENTRY,
  UPDATE_ANNOUNCEMENTS_META,
  UPDATE_POLL_VOTE_CACHE,
  UPDATE_PROPOSALS_VOTE_META,
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
  choices: number[];
  userHp: number;
  username: string;
  votedAt: number;
  expiresAt: number;
  status: CacheStatus;
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
  rewardValue: number;
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

export interface ProposalVoteMeta {
  dismissedAt: number;
  processed: boolean;
}

export interface LastUpdateMeta {
  postPath: string;
  updatedAt: number;
  type: 'vote' | 'comment' | 'draft' | 'poll-vote';
}

interface State {
  votesCollection: { [key: string]: VoteCache };
  pollVotesCollection: { [key: string]: PollVoteCache };
  draftsCollection: { [key: string]: Draft };
  replyCache: { [key: string]: Draft }; // For waves and reply autosave
  claimsCollection: ClaimsCollection;
  subscribedCommunities: Map<string, SubscribedCommunity>;
  pointActivities: Map<string, PointActivity>;
  announcementsMeta: { [key: string]: AnnouncementMeta };
  proposalsVoteMeta: { [key: string]: ProposalVoteMeta }; // proposal cache id: [proposalId]_[username]
  lastUpdate: LastUpdateMeta;
}

const initialState: State = {
  votesCollection: {},
  pollVotesCollection: {},
  draftsCollection: {},
  replyCache: {},
  claimsCollection: {},
  announcementsMeta: {},
  proposalsVoteMeta: {},
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

    case UPDATE_POLL_VOTE_CACHE:
      if (!state.pollVotesCollection) {
        state.pollVotesCollection = {};
      }
      state.pollVotesCollection = {
        ...state.pollVotesCollection,
        [payload.postPath]: payload.pollVote,
      };
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.postPath,
          updatedAt: new Date().getTime(),
          type: 'poll-vote',
        },
      };

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

    case UPDATE_REPLY_CACHE: {
      if (!payload.id || !payload.draft) {
        return state;
      }

      if (!state.replyCache) {
        state.replyCache = {};
      }

      const replyTime = new Date().getTime();
      const curReply = state.replyCache[payload.id];
      const payloadReply = payload.draft;

      payloadReply.created = curReply?.created || replyTime;
      payloadReply.updated = replyTime;
      payloadReply.expiresAt = replyTime + 604800000; // 7 days ms

      state.replyCache[payload.id] = payloadReply;
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
        lastUpdate: {
          postPath: payload.id,
          updatedAt: new Date().getTime(),
          type: 'draft',
        },
      };
    }

    case DELETE_REPLY_CACHE_ENTRY:
      if (state.replyCache && state.replyCache[payload]) {
        delete state.replyCache[payload];
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

    case UPDATE_PROPOSALS_VOTE_META:
      if (!state.proposalsVoteMeta) {
        state.proposalsVoteMeta = {};
      }

      // const _isVoted = state.proposalsVoteMeta[payload.id]?.isVoted || false;

      state.proposalsVoteMeta = {
        ...state.proposalsVoteMeta,
        [payload.id]: {
          processed: payload.processed,
          dismissedAt: payload.dismissedAt,
        } as ProposalVoteMeta,
      };
      return {
        ...state, // spread operator in requried here, otherwise persist do not register change
      };

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

      if (state.replyCache) {
        Object.keys(state.replyCache).forEach((key) => {
          const reply = state.replyCache[key];
          if (reply && ((reply?.expiresAt || 0) < currentTime || !reply.body)) {
            delete state.replyCache[key];
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
