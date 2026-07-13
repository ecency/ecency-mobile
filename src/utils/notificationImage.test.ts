import { getNotificationImageUrl } from './notificationImage';

jest.mock('@ecency/render-helper', () => ({
  proxifyImageSrc: jest.fn((url: string, w: number, h: number) => `proxy(${w}x${h}):${url}`),
}));

const IMG = 'https://images.ecency.com/p/original.jpg';

describe('getNotificationImageUrl', () => {
  it('uses the parent post image for a reply, which is the post that was replied to', () => {
    const url = getNotificationImageUrl({
      type: 'reply',
      parent_img_url: IMG,
      img_url: 'https://images.ecency.com/p/the-reply-itself.jpg',
    });

    expect(url).toBe(`proxy(96x96):${IMG}`);
  });

  it.each(['mention', 'reblog', 'scheduled_published', 'favorites', 'payouts'])(
    'uses img_url for a %s',
    (type) => {
      expect(getNotificationImageUrl({ type, img_url: IMG })).toBe(`proxy(96x96):${IMG}`);
    },
  );

  it('uses the parent post image for a bookmark, i.e. the post that was bookmarked', () => {
    // A bookmarks notification fires when someone comments on a post you saved,
    // so the useful image is the saved post's, not the comment's.
    const url = getNotificationImageUrl({
      type: 'bookmarks',
      parent_img_url: IMG,
      img_url: 'https://images.ecency.com/p/the-comment.jpg',
    });

    expect(url).toBe(`proxy(96x96):${IMG}`);
  });

  it('shows no thumbnail for votes, which would just repeat the user own post', () => {
    expect(getNotificationImageUrl({ type: 'vote', img_url: IMG })).toBeNull();
    expect(getNotificationImageUrl({ type: 'unvote', img_url: IMG })).toBeNull();
  });

  it('shows no thumbnail for types that carry no post image', () => {
    expect(getNotificationImageUrl({ type: 'follow' })).toBeNull();
    expect(getNotificationImageUrl({ type: 'transfer', amount: '1.000 HIVE' })).toBeNull();
  });

  it('handles a missing or null image, which the API allows on every type', () => {
    expect(getNotificationImageUrl({ type: 'mention', img_url: null })).toBeNull();
    expect(getNotificationImageUrl({ type: 'reply', parent_img_url: null })).toBeNull();
    expect(getNotificationImageUrl({ type: 'mention' })).toBeNull();
  });

  it('proxies the raw url down rather than fetching the full-size original', () => {
    // The API returns the post's json_metadata image, which can be many MB.
    expect(getNotificationImageUrl({ type: 'mention', img_url: IMG })).toContain('proxy(96x96)');
  });

  it('survives a malformed notification', () => {
    expect(getNotificationImageUrl(null)).toBeNull();
    expect(getNotificationImageUrl(undefined)).toBeNull();
    expect(getNotificationImageUrl({})).toBeNull();
    expect(getNotificationImageUrl({ type: 'mention', img_url: { nested: 'object' } })).toBeNull();
  });
});
