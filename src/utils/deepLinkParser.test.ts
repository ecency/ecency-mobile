// Mock SDK query client
import { deepLinkParser } from './deepLinkParser';
import ROUTES from '../constants/routeNames';

jest.mock('@ecency/sdk', () => ({
  getQueryClient: jest.fn(() => ({
    fetchQuery: jest.fn((_opts) => Promise.resolve({ name: 'mockuser', reputation: 50 })),
  })),
  getAccountFullQueryOptions: jest.fn((author) => ({ queryKey: ['account', author] })),
}));

describe('deepLinkParser', () => {
  it('returns undefined for null/empty url', async () => {
    expect(await deepLinkParser(null)).toBeUndefined();
    expect(await deepLinkParser('')).toBeUndefined();
  });

  it('returns undefined for ShareMedia urls', async () => {
    expect(await deepLinkParser('ShareMedia://test')).toBeUndefined();
  });

  describe('post URLs', () => {
    it('parses author/permlink post url', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/my-first-post');
      expect(result.name).toBe(ROUTES.SCREENS.POST);
      expect(result.params).toEqual({ author: 'alice', permlink: 'my-first-post' });
      expect(result.key).toBe('alice/my-first-post');
    });

    it('parses ecency:// deep link for posts', async () => {
      const result = await deepLinkParser('ecency://@alice/my-post');
      expect(result.name).toBe(ROUTES.SCREENS.POST);
      expect(result.params.author).toBe('alice');
      expect(result.params.permlink).toBe('my-post');
    });
  });

  describe('profile URLs', () => {
    it('routes to profile when author only (no permlink)', async () => {
      const result = await deepLinkParser('https://ecency.com/@alice');
      expect(result.name).toBe(ROUTES.SCREENS.PROFILE);
      expect(result.params.username).toBe('mockuser');
    });

    it('routes to profile with wallet filter', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/wallet');
      expect(result.name).toBe(ROUTES.SCREENS.PROFILE);
      expect(result.params.deepLinkFilter).toBe('wallet');
    });

    it('maps points filter to wallet', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/points');
      expect(result.name).toBe(ROUTES.SCREENS.PROFILE);
      expect(result.params.deepLinkFilter).toBe('wallet');
    });

    it('routes to profile with comments filter', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/comments');
      expect(result.name).toBe(ROUTES.SCREENS.PROFILE);
      expect(result.params.deepLinkFilter).toBe('comments');
    });

    it('routes to profile with replies filter', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/replies');
      expect(result.name).toBe(ROUTES.SCREENS.PROFILE);
      expect(result.params.deepLinkFilter).toBe('replies');
    });

    it('routes to profile with posts filter', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/posts');
      expect(result.name).toBe(ROUTES.SCREENS.PROFILE);
      expect(result.params.deepLinkFilter).toBe('posts');
    });

    it('routes communities permlink to web browser', async () => {
      const result = await deepLinkParser('https://ecency.com/hive/@alice/communities');
      expect(result.name).toBe(ROUTES.SCREENS.WEB_BROWSER);
    });
  });

  describe('feed URLs', () => {
    it('routes trending feed', async () => {
      const result = await deepLinkParser('https://ecency.com/trending/hive');
      expect(result.name).toBe(ROUTES.SCREENS.TAG_RESULT);
      expect(result.params.filter).toBe('trending');
      expect(result.params.tag).toBe('hive');
    });

    it('routes hot feed', async () => {
      const result = await deepLinkParser('https://ecency.com/hot/photography');
      expect(result.name).toBe(ROUTES.SCREENS.TAG_RESULT);
      expect(result.params.filter).toBe('hot');
    });

    it('routes created feed', async () => {
      const result = await deepLinkParser('https://ecency.com/created/art');
      expect(result.name).toBe(ROUTES.SCREENS.TAG_RESULT);
      expect(result.params.filter).toBe('created');
    });

    it('routes community tag to COMMUNITY screen', async () => {
      const result = await deepLinkParser('https://ecency.com/trending/hive-174301');
      expect(result.name).toBe(ROUTES.SCREENS.COMMUNITY);
      expect(result.params.tag).toBe('hive-174301');
    });

    it('routes feed without tag', async () => {
      const result = await deepLinkParser('https://ecency.com/trending');
      expect(result.name).toBe(ROUTES.SCREENS.TAG_RESULT);
      expect(result.params.filter).toBe('trending');
    });
  });

  describe('auth URLs', () => {
    it('parses signup URL', async () => {
      const result = await deepLinkParser('https://ecency.com/signup?referral=alice');
      expect(result.name).toBe(ROUTES.SCREENS.REGISTER);
      expect(result.params.referredUser).toBe('alice');
    });

    it('parses auth URL', async () => {
      const result = await deepLinkParser('https://ecency.com/auth?username=alice&code=abc123');
      expect(result.name).toBe(ROUTES.SCREENS.LOGIN);
      expect(result.params.username).toBe('alice');
      expect(result.params.code).toBe('abc123');
    });
  });

  describe('purchase URLs', () => {
    it('parses boost purchase', async () => {
      const result = await deepLinkParser('https://ecency.com/purchase?type=boost&username=alice');
      expect(result.name).toBe(ROUTES.SCREENS.ACCOUNT_BOOST);
      expect(result.params.username).toBe('alice');
    });

    it('parses points purchase', async () => {
      const result = await deepLinkParser(
        'https://ecency.com/purchase?type=points&username=alice&product_id=999points',
      );
      expect(result.name).toBe(ROUTES.SCREENS.BOOST);
      expect(result.params.username).toBe('alice');
      expect(result.params.productId).toBe('999points');
    });

    it('parses account purchase', async () => {
      const result = await deepLinkParser(
        'https://ecency.com/purchase?type=account&username=newuser&email=a@b.com&referral=alice',
      );
      expect(result.name).toBe(ROUTES.SCREENS.REGISTER);
      expect(result.params.purchaseOnly).toBe(true);
      expect(result.params.email).toBe('a@b.com');
    });
  });
});
