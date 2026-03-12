// Mock store.ts to break the circular import chain:
// migrationHelpers → sheets import (via assetsSelect) → hooks → sdk/mutations → store → migrationHelpers
import { migrateSelectedTokens } from './migrationHelpers';
import { TokenType } from '../screens/assetsSelect/screen/assetsSelect';

// Only test the pure, synchronous functions from migrationHelpers.
// The async functions (migrateSettings, migrateUserEncryption, repairUserAccountData)
// depend heavily on realm, auth, redux dispatch, and network — better suited for integration tests.

// Import reduxMigrations via the default export
import migrationExports from './migrationHelpers';

jest.mock('../redux/store/store', () => ({ __esModule: true, default: {} }));
jest.mock('../navigation/sheets', () => ({ SheetNames: { ACTION_MODAL: 'ACTION_MODAL' } }));
// Mock assetsSelect to avoid pulling in the entire component tree
jest.mock('../screens/assetsSelect/screen/assetsSelect', () => ({
  TokenType: { ENGINE: 'ENGINE', SPK: 'SPK', HIVE: 'HIVE', CHAIN: 'CHAIN' },
}));
jest.mock('react-native-config', () => ({ DEFAULT_PIN: 'test-pin', PIN_KEY: 'test-key' }));
jest.mock('react-native-actions-sheet', () => ({ SheetManager: { show: jest.fn() } }));
jest.mock('../providers/hive/auth', () => ({}));
jest.mock('../providers/hive/dhive', () => ({ getDigitPinCode: jest.fn() }));
jest.mock('../providers/queries', () => ({
  getQueryClient: jest.fn(() => ({ fetchQuery: jest.fn() })),
}));
jest.mock('../providers/ecency/ePoint', () => ({ getPointsSummary: jest.fn() }));
jest.mock('../realm/realm', () => ({
  getSCAccount: jest.fn(),
  getSettings: jest.fn(),
  getUserDataWithUsername: jest.fn(),
  removeUserData: jest.fn(),
}));
jest.mock('../redux/actions/accountAction', () => ({
  updateCurrentAccount: jest.fn(),
  updateOtherAccount: jest.fn(),
}));
jest.mock('../redux/actions/applicationActions', () => ({
  changeNotificationSettings: jest.fn(),
  changeAllNotificationSettings: jest.fn(),
  setApi: jest.fn(),
  setCurrency: jest.fn(),
  setLanguage: jest.fn(),
  setNsfw: jest.fn(),
  isDefaultFooter: jest.fn(),
  isPinCodeOpen: jest.fn(),
  setColorTheme: jest.fn(),
  setSettingsMigrated: jest.fn(),
  setPinCode: jest.fn(),
  setEncryptedUnlockPin: jest.fn(),
  setPostUpvotePercent: jest.fn(),
  setCommentUpvotePercent: jest.fn(),
  setIsDarkTheme: jest.fn(),
}));
jest.mock('../redux/actions/communitiesAction', () => ({ fetchSubscribedCommunities: jest.fn() }));
jest.mock('../redux/actions/uiAction', () => ({
  setRcOffer: jest.fn(),
  toastNotification: jest.fn(),
}));
jest.mock('../navigation/rootNavigation', () => ({ navigate: jest.fn() }));
jest.mock('./editor', () => ({ delay: jest.fn() }));
const { reduxMigrations } = migrationExports;

describe('migrateSelectedTokens', () => {
  describe('object-to-array migration', () => {
    it('converts old object format to ProfileToken array', () => {
      const oldFormat = {
        engine: ['BEE', 'LEO'],
        spk: ['LARYNX'],
      };
      const result = migrateSelectedTokens(oldFormat);
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { symbol: 'BEE', type: TokenType.ENGINE, meta: { show: true } },
        { symbol: 'LEO', type: TokenType.ENGINE, meta: { show: true } },
        { symbol: 'LARYNX', type: TokenType.SPK, meta: { show: true } },
      ]);
    });

    it('handles empty arrays in old format', () => {
      const oldFormat = { engine: [], spk: [] };
      const result = migrateSelectedTokens(oldFormat);
      expect(result).toEqual([]);
    });

    it('handles missing arrays in old format', () => {
      const oldFormat = { engine: null, spk: 'not-array' };
      const result = migrateSelectedTokens(oldFormat);
      expect(result).toEqual([]);
    });
  });

  describe('missing meta repair', () => {
    it('adds meta to tokens missing it', () => {
      const tokens = [
        { symbol: 'BEE', type: TokenType.ENGINE },
        { symbol: 'LEO', type: TokenType.ENGINE, meta: { show: true } },
      ];
      const result = migrateSelectedTokens(tokens);
      expect(result).toHaveLength(2);
      expect(result[0].meta).toEqual({ show: true });
      expect(result[1].meta).toEqual({ show: true });
    });

    it('deduplicates by symbol+type, preferring entry with meta', () => {
      const tokens = [
        { symbol: 'BEE', type: TokenType.ENGINE },
        { symbol: 'BEE', type: TokenType.ENGINE, meta: { show: true } },
      ];
      const result = migrateSelectedTokens(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].meta).toEqual({ show: true });
    });
  });

  describe('no migration needed', () => {
    it('returns null when array already has meta on all entries', () => {
      const tokens = [{ symbol: 'BEE', type: TokenType.ENGINE, meta: { show: true } }];
      const result = migrateSelectedTokens(tokens);
      expect(result).toBeNull();
    });
  });
});

describe('reduxMigrations', () => {
  describe('v0: upvotePercent split', () => {
    it('splits upvotePercent into post and comment', () => {
      const state = { application: { upvotePercent: 75 } };
      const result = reduxMigrations[0](state);
      expect(result.application.postUpvotePercent).toBe(75);
      expect(result.application.commentUpvotePercent).toBe(75);
      expect(result.application.upvotePercent).toBeUndefined();
    });
  });

  describe('v1: favoriteNotification', () => {
    it('adds favoriteNotification', () => {
      const state = { application: { notificationDetails: {} } };
      const result = reduxMigrations[1](state);
      expect(result.application.notificationDetails.favoriteNotification).toBe(true);
    });
  });

  describe('v2: bookmarkNotification', () => {
    it('adds bookmarkNotification', () => {
      const state = { application: { notificationDetails: {} } };
      const result = reduxMigrations[2](state);
      expect(result.application.notificationDetails.bookmarkNotification).toBe(true);
    });
  });

  describe('v3: drafts array to object', () => {
    it('converts drafts array to keyed object', () => {
      const state = {
        cache: {
          drafts: [
            ['key1', { body: 'draft1', author: 'alice', updated: 1000 }],
            ['key2', { body: 'draft2', author: 'bob', updated: 2000 }],
          ],
        },
      };
      const result = reduxMigrations[3](state);
      expect(result.cache.draftsCollection['key1'].body).toBe('draft1');
      expect(result.cache.draftsCollection['key2'].body).toBe('draft2');
      expect(result.cache.drafts).toBeUndefined();
    });

    it('skips invalid entries missing required fields', () => {
      const state = {
        cache: {
          drafts: [
            ['key1', { body: 'draft1', author: 'alice', updated: 1000 }],
            [null, { body: 'orphan' }],
            ['key3', { author: 'alice' }], // missing body
          ],
        },
      };
      const result = reduxMigrations[3](state);
      expect(Object.keys(result.cache.draftsCollection)).toHaveLength(1);
    });

    it('handles non-array drafts', () => {
      const state = { cache: { drafts: 'not-array' } };
      const result = reduxMigrations[3](state);
      expect(result.cache.draftsCollection).toEqual({});
    });
  });

  describe('v4: comments array to object', () => {
    it('converts comments array to keyed object', () => {
      const state = {
        cache: {
          comments: [['c1', { body: 'comment', parent_author: 'alice', parent_permlink: 'post' }]],
        },
      };
      const result = reduxMigrations[4](state);
      expect(result.cache.commentsCollection['c1'].body).toBe('comment');
      expect(result.cache.comments).toBeUndefined();
    });
  });

  describe('v5: votesCollection init', () => {
    it('initializes empty votesCollection', () => {
      const state = { cache: {} };
      const result = reduxMigrations[5](state);
      expect(result.cache.votesCollection).toEqual({});
    });
  });

  describe('v6: waveUpvotePercent', () => {
    it('copies commentUpvotePercent to waveUpvotePercent', () => {
      const state = { application: { commentUpvotePercent: 50 } };
      const result = reduxMigrations[6](state);
      expect(result.application.waveUpvotePercent).toBe(50);
    });
  });

  describe('v7: announcementsMeta init', () => {
    it('initializes empty announcementsMeta', () => {
      const state = { cache: {} };
      expect(reduxMigrations[7](state).cache.announcementsMeta).toEqual({});
    });
  });

  describe('v8: pollVotesCollection init', () => {
    it('initializes empty pollVotesCollection', () => {
      const state = { cache: {} };
      expect(reduxMigrations[8](state).cache.pollVotesCollection).toEqual({});
    });
  });

  describe('v9: pollDraftsMap init', () => {
    it('initializes empty pollDraftsMap', () => {
      const state = { editor: {} };
      expect(reduxMigrations[9](state).editor.pollDraftsMap).toEqual({});
    });
  });

  describe('v11: proposalsVoteMeta init', () => {
    it('initializes empty proposalsVoteMeta', () => {
      const state = { cache: {} };
      expect(reduxMigrations[11](state).cache.proposalsVoteMeta).toEqual({});
    });
  });

  describe('v13: selectedAssets migration', () => {
    it('migrates selectedCoins to selectedAssets and fixes first symbol to POINTS', () => {
      const state = {
        wallet: { selectedCoins: [{ symbol: 'HIVE' }, { symbol: 'HBD' }] },
        cache: {},
      };
      const result = reduxMigrations[13](state);
      // v13 always ensures first asset is POINTS
      expect(result.wallet.selectedAssets[0].symbol).toBe('POINTS');
      expect(result.wallet.selectedAssets[1].symbol).toBe('HBD');
      expect(result.wallet.selectedCoins).toBeUndefined();
      expect(result.wallet.coinsData).toBeUndefined();
      expect(result.cache.claimsCollection).toEqual({});
    });

    it('fixes first asset symbol to POINTS if wrong', () => {
      const state = {
        wallet: { selectedCoins: [{ symbol: 'WRONG' }, { symbol: 'HIVE' }] },
        cache: {},
      };
      const result = reduxMigrations[13](state);
      expect(result.wallet.selectedAssets[0].symbol).toBe('POINTS');
    });
  });

  describe('v14: reply/wave draft separation', () => {
    it('moves wave drafts to replyCache', () => {
      const state = {
        cache: {
          draftsCollection: {
            'alice/ecency.waves': { author: 'alice', body: 'wave post' },
            DEFAULT_USER_DRAFT_ID_alice: { author: 'alice', body: 'real draft' },
          },
        },
      };
      const result = reduxMigrations[14](state);
      expect(result.cache.replyCache['alice/ecency.waves']).toBeDefined();
      expect(result.cache.draftsCollection['alice/ecency.waves']).toBeUndefined();
      expect(result.cache.draftsCollection['DEFAULT_USER_DRAFT_ID_alice']).toBeDefined();
    });

    it('moves reply drafts (3-part key) to replyCache', () => {
      const state = {
        cache: {
          draftsCollection: {
            'alice/bob/some-post': { author: 'alice', body: 'reply body' },
            'simple-draft': { author: 'alice', body: 'simple' },
          },
        },
      };
      const result = reduxMigrations[14](state);
      expect(result.cache.replyCache['alice/bob/some-post']).toBeDefined();
      expect(result.cache.draftsCollection['simple-draft']).toBeDefined();
    });

    it('handles empty draftsCollection', () => {
      const state = { cache: { draftsCollection: {} } };
      const result = reduxMigrations[14](state);
      expect(result.cache.replyCache).toEqual({});
    });

    it('handles missing draftsCollection', () => {
      const state = { cache: {} };
      const result = reduxMigrations[14](state);
      expect(result.cache.replyCache).toEqual({});
    });
  });
});
