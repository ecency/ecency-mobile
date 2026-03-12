import cacheReducer, { CacheStatus } from './cacheReducer';
import {
  PURGE_EXPIRED_CACHE,
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

const initialState = () => ({
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
});

describe('cacheReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = cacheReducer(undefined, { type: 'UNKNOWN' });
    expect(state.votesCollection).toEqual({});
    expect(state.draftsCollection).toEqual({});
  });

  describe('UPDATE_DRAFT_CACHE', () => {
    it('adds a new draft', () => {
      const state = initialState();
      const draft = { author: 'alice', body: 'hello' };
      const result = cacheReducer(state, {
        type: UPDATE_DRAFT_CACHE,
        payload: { id: 'draft-1', draft },
      });
      expect(result.draftsCollection['draft-1']).toBeDefined();
      expect(result.draftsCollection['draft-1'].body).toBe('hello');
      expect(result.draftsCollection['draft-1'].created).toBeDefined();
      expect(result.draftsCollection['draft-1'].updated).toBeDefined();
      expect(result.draftsCollection['draft-1'].expiresAt).toBeDefined();
      expect(result.lastUpdate.type).toBe('draft');
    });

    it('preserves created timestamp on update', () => {
      const state = initialState();
      state.draftsCollection['draft-1'] = {
        author: 'alice',
        body: 'old',
        created: 1000,
        updated: 1000,
        expiresAt: 999999999999,
      };
      const result = cacheReducer(state, {
        type: UPDATE_DRAFT_CACHE,
        payload: { id: 'draft-1', draft: { author: 'alice', body: 'new' } },
      });
      expect(result.draftsCollection['draft-1'].created).toBe(1000);
      expect(result.draftsCollection['draft-1'].body).toBe('new');
    });

    it('sets 7-day expiry', () => {
      const before = Date.now();
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_DRAFT_CACHE,
        payload: { id: 'd1', draft: { author: 'a', body: 'b' } },
      });
      const expiry = result.draftsCollection['d1'].expiresAt;
      // 7 days = 604800000ms
      expect(expiry).toBeGreaterThanOrEqual(before + 604800000);
    });

    it('ignores payload without id', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_DRAFT_CACHE,
        payload: { draft: { body: 'x' } },
      });
      expect(Object.keys(result.draftsCollection)).toHaveLength(0);
    });

    it('ignores payload without draft', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_DRAFT_CACHE,
        payload: { id: 'd1' },
      });
      expect(Object.keys(result.draftsCollection)).toHaveLength(0);
    });
  });

  describe('DELETE_DRAFT_CACHE_ENTRY', () => {
    it('deletes existing draft', () => {
      const state = initialState();
      state.draftsCollection['d1'] = { author: 'a', body: 'b' };
      const result = cacheReducer(state, {
        type: DELETE_DRAFT_CACHE_ENTRY,
        payload: 'd1',
      });
      expect(result.draftsCollection['d1']).toBeUndefined();
    });

    it('handles deleting non-existent draft gracefully', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: DELETE_DRAFT_CACHE_ENTRY,
        payload: 'missing',
      });
      expect(result.draftsCollection).toEqual({});
    });
  });

  describe('UPDATE_REPLY_CACHE', () => {
    it('adds a reply to cache', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_REPLY_CACHE,
        payload: { id: 'reply-1', draft: { author: 'a', body: 'reply' } },
      });
      expect(result.replyCache['reply-1'].body).toBe('reply');
      expect(result.replyCache['reply-1'].expiresAt).toBeDefined();
    });

    it('ignores missing id or draft', () => {
      const state = initialState();
      expect(cacheReducer(state, { type: UPDATE_REPLY_CACHE, payload: {} })).toBe(state);
    });
  });

  describe('DELETE_REPLY_CACHE_ENTRY', () => {
    it('deletes reply', () => {
      const state = initialState();
      state.replyCache['r1'] = { author: 'a', body: 'b' };
      const result = cacheReducer(state, { type: DELETE_REPLY_CACHE_ENTRY, payload: 'r1' });
      expect(result.replyCache['r1']).toBeUndefined();
    });
  });

  describe('UPDATE_POLL_VOTE_CACHE', () => {
    it('adds poll vote', () => {
      const state = initialState();
      const pollVote = {
        choices: [1],
        userHp: 100,
        username: 'alice',
        votedAt: Date.now(),
        expiresAt: Date.now() + 60000,
        status: CacheStatus.PUBLISHED,
      };
      const result = cacheReducer(state, {
        type: UPDATE_POLL_VOTE_CACHE,
        payload: { postPath: 'author/post', pollVote },
      });
      expect(result.pollVotesCollection['author/post']).toEqual(pollVote);
      expect(result.lastUpdate.type).toBe('poll-vote');
    });
  });

  describe('UPDATE_CLAIM_CACHE', () => {
    it('adds claim with 3-minute expiry', () => {
      const before = Date.now();
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_CLAIM_CACHE,
        payload: { assetId: 'HIVE', rewardValue: 1.5 },
      });
      expect(result.claimsCollection['HIVE'].rewardValue).toBe(1.5);
      expect(result.claimsCollection['HIVE'].expiresAt).toBeGreaterThanOrEqual(before + 180000);
    });

    it('ignores missing assetId or rewardValue', () => {
      const state = initialState();
      expect(cacheReducer(state, { type: UPDATE_CLAIM_CACHE, payload: {} })).toBe(state);
      expect(cacheReducer(state, { type: UPDATE_CLAIM_CACHE, payload: { assetId: 'X' } })).toBe(
        state,
      );
    });
  });

  describe('DELETE_CLAIM_CACHE_ENTRY', () => {
    it('removes claim', () => {
      const state = initialState();
      state.claimsCollection['HIVE'] = { rewardValue: 1 };
      const result = cacheReducer(state, { type: DELETE_CLAIM_CACHE_ENTRY, payload: 'HIVE' });
      expect(result.claimsCollection['HIVE']).toBeUndefined();
    });
  });

  describe('UPDATE_SUBSCRIBED_COMMUNITY_CACHE', () => {
    it('adds community to map', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_SUBSCRIBED_COMMUNITY_CACHE,
        payload: { path: 'hive-123', subscribedCommunity: { data: ['test'] } },
      });
      expect(result.subscribedCommunities.get('hive-123')).toEqual({ data: ['test'] });
    });
  });

  describe('DELETE_SUBSCRIBED_COMMUNITY_CACHE', () => {
    it('removes community from map', () => {
      const state = initialState();
      state.subscribedCommunities.set('hive-123', { data: [] });
      const result = cacheReducer(state, {
        type: DELETE_SUBSCRIBED_COMMUNITY_CACHE,
        payload: 'hive-123',
      });
      expect(result.subscribedCommunities.has('hive-123')).toBe(false);
    });
  });

  describe('CLEAR_SUBSCRIBED_COMMUNITIES_CACHE', () => {
    it('clears all communities', () => {
      const state = initialState();
      state.subscribedCommunities.set('a', { data: [] });
      state.subscribedCommunities.set('b', { data: [] });
      const result = cacheReducer(state, {
        type: CLEAR_SUBSCRIBED_COMMUNITIES_CACHE,
        payload: null,
      });
      expect(result.subscribedCommunities.size).toBe(0);
    });
  });

  describe('UPDATE_POINT_ACTIVITY_CACHE', () => {
    it('adds point activity', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_POINT_ACTIVITY_CACHE,
        payload: { id: 'p1', pointActivity: { amount: 10 } },
      });
      expect(result.pointActivities.get('p1')).toEqual({ amount: 10 });
    });
  });

  describe('DELETE_POINT_ACTIVITY_CACHE_ENTRY', () => {
    it('removes point activity', () => {
      const state = initialState();
      state.pointActivities.set('p1', { amount: 10 } as any);
      const result = cacheReducer(state, {
        type: DELETE_POINT_ACTIVITY_CACHE_ENTRY,
        payload: 'p1',
      });
      expect(result.pointActivities.has('p1')).toBe(false);
    });
  });

  describe('UPDATE_ANNOUNCEMENTS_META', () => {
    it('adds announcement meta', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_ANNOUNCEMENTS_META,
        payload: { id: 'ann-1', processed: false },
      });
      expect(result.announcementsMeta['ann-1']).toBeDefined();
      expect(result.announcementsMeta['ann-1'].lastSeen).toBeDefined();
    });

    it('preserves processed=true once set', () => {
      const state = initialState();
      state.announcementsMeta['ann-1'] = { processed: true, lastSeen: 1000 };
      const result = cacheReducer(state, {
        type: UPDATE_ANNOUNCEMENTS_META,
        payload: { id: 'ann-1', processed: false },
      });
      expect(result.announcementsMeta['ann-1'].processed).toBe(true);
    });
  });

  describe('UPDATE_PROPOSALS_VOTE_META', () => {
    it('sets proposal vote meta', () => {
      const state = initialState();
      const result = cacheReducer(state, {
        type: UPDATE_PROPOSALS_VOTE_META,
        payload: { id: 'prop-1', processed: true, dismissedAt: 5000 },
      });
      expect(result.proposalsVoteMeta['prop-1'].processed).toBe(true);
      expect(result.proposalsVoteMeta['prop-1'].dismissedAt).toBe(5000);
    });
  });

  describe('PURGE_EXPIRED_CACHE', () => {
    it('removes expired votes', () => {
      const state = initialState();
      state.votesCollection['v1'] = { expiresAt: 1, status: CacheStatus.PUBLISHED } as any;
      state.votesCollection['v2'] = {
        expiresAt: Date.now() + 99999,
        status: CacheStatus.PUBLISHED,
      } as any;
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.votesCollection['v1']).toBeUndefined();
      expect(result.votesCollection['v2']).toBeDefined();
    });

    it('removes expired poll votes', () => {
      const state = initialState();
      state.pollVotesCollection['p1'] = { expiresAt: 1 } as any;
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.pollVotesCollection['p1']).toBeUndefined();
    });

    it('removes expired drafts', () => {
      const state = initialState();
      state.draftsCollection['d1'] = { author: 'a', body: 'b', expiresAt: 1 };
      state.draftsCollection['d2'] = { author: 'a', body: 'b', expiresAt: Date.now() + 99999 };
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.draftsCollection['d1']).toBeUndefined();
      expect(result.draftsCollection['d2']).toBeDefined();
    });

    it('removes drafts with empty body', () => {
      const state = initialState();
      state.draftsCollection['d1'] = { author: 'a', body: '', expiresAt: Date.now() + 99999 };
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.draftsCollection['d1']).toBeUndefined();
    });

    it('removes expired reply cache entries', () => {
      const state = initialState();
      state.replyCache['r1'] = { author: 'a', body: 'b', expiresAt: 1 };
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.replyCache['r1']).toBeUndefined();
    });

    it('removes expired claims', () => {
      const state = initialState();
      state.claimsCollection['c1'] = { rewardValue: 1, expiresAt: 1 };
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.claimsCollection['c1']).toBeUndefined();
    });

    it('removes expired subscribed communities', () => {
      const state = initialState();
      state.subscribedCommunities.set('old', { data: [], expiresAt: 1 });
      state.subscribedCommunities.set('fresh', { data: [], expiresAt: Date.now() + 99999 });
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.subscribedCommunities.has('old')).toBe(false);
      expect(result.subscribedCommunities.has('fresh')).toBe(true);
    });

    it('handles empty state gracefully', () => {
      const state = initialState();
      const result = cacheReducer(state, { type: PURGE_EXPIRED_CACHE, payload: null });
      expect(result.votesCollection).toEqual({});
      expect(result.draftsCollection).toEqual({});
    });
  });
});
