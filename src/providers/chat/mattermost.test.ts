import { getChannelUnreadMeta, getChannelUnreadTotal } from './mattermost';

// The module pulls in the API client, realm and crypto at import time; none of
// them are involved in the pure badge math under test.
jest.mock('../../config/chatApi', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  setChatApiToken: jest.fn(),
}));
jest.mock('../hive/hive', () => ({ getDigitPinCode: jest.fn() }));
jest.mock('../../utils/crypto', () => ({ decryptKey: jest.fn() }));
jest.mock('../../realm/realm', () => ({ getSCAccount: jest.fn() }));

describe('getChannelUnreadTotal', () => {
  it('counts unread messages of a viewed channel', () => {
    expect(getChannelUnreadTotal({ type: 'O', last_viewed_at: 1000, message_count: 4 })).toBe(4);
  });

  it('ignores a muted channel', () => {
    expect(
      getChannelUnreadTotal({ type: 'O', last_viewed_at: 1000, message_count: 4, is_muted: true }),
    ).toBe(0);
  });

  it('ignores a channel that was never viewed', () => {
    expect(getChannelUnreadTotal({ type: 'O', last_viewed_at: null, message_count: 9 })).toBe(0);
  });

  // The regression: Mattermost reports "never viewed" as 0, not as null, so
  // every auto-joined community channel used to dump its whole history into
  // the badge.
  it('treats last_viewed_at of 0 as never viewed', () => {
    expect(getChannelUnreadTotal({ type: 'O', last_viewed_at: 0, message_count: 900 })).toBe(0);
  });

  // The mirror image: a first DM from someone new is ALWAYS last_viewed_at 0,
  // so the never-viewed rule must not reach DMs.
  it('counts a never-viewed DM', () => {
    expect(getChannelUnreadTotal({ type: 'D', last_viewed_at: 0, message_count: 2 })).toBe(2);
  });

  it('counts a DM that has no last_viewed_at at all', () => {
    expect(getChannelUnreadTotal({ type: 'D', message_count: 1 })).toBe(1);
  });

  it('still ignores a muted DM', () => {
    expect(
      getChannelUnreadTotal({ type: 'D', last_viewed_at: 0, message_count: 2, is_muted: true }),
    ).toBe(0);
  });

  // The server knows about DMs whose posts were all deleted; the channel
  // payload alone cannot express that, so its verdict wins.
  it('honours unread_eligible=false from the server', () => {
    expect(
      getChannelUnreadTotal({
        type: 'D',
        last_viewed_at: 1000,
        message_count: 2,
        mention_count: 2,
        unread_eligible: false,
      }),
    ).toBe(0);
  });

  it('does not require unread_eligible to be present', () => {
    expect(getChannelUnreadTotal({ type: 'D', last_viewed_at: 1000, message_count: 3 })).toBe(3);
  });

  it('uses mentions when they exceed the message count', () => {
    expect(
      getChannelUnreadTotal({
        type: 'O',
        last_viewed_at: 1000,
        message_count: 1,
        mention_count: 5,
      }),
    ).toBe(5);
  });

  // Group messages cannot be auto-joined either, so the never-viewed guard has
  // nothing to protect against there.
  it('counts a never-viewed group message', () => {
    expect(getChannelUnreadTotal({ type: 'G', last_viewed_at: 0, message_count: 3 })).toBe(3);
  });
});

// The channel list used to carry its own copy of this rule, so a row could show
// a badge the global count did not include. Both now read the same helper.
describe('getChannelUnreadMeta', () => {
  it('returns the full breakdown for an eligible channel', () => {
    expect(
      getChannelUnreadMeta({
        type: 'O',
        last_viewed_at: 1000,
        message_count: 4,
        mention_count: 2,
      }),
    ).toEqual({
      unreadMentions: 2,
      unreadMessages: 4,
      unreadCount: 2,
      totalUnread: 4,
    });
  });

  it('zeroes every field of an ineligible channel', () => {
    expect(
      getChannelUnreadMeta({
        type: 'O',
        last_viewed_at: 0,
        message_count: 900,
        mention_count: 7,
      }),
    ).toEqual({
      unreadMentions: 0,
      unreadMessages: 0,
      unreadCount: 0,
      totalUnread: 0,
    });
  });

  it('agrees with getChannelUnreadTotal across every branch', () => {
    const channels = [
      { type: 'O', last_viewed_at: 1000, message_count: 4 },
      { type: 'O', last_viewed_at: 0, message_count: 900 },
      { type: 'O', last_viewed_at: null, message_count: 9 },
      { type: 'D', last_viewed_at: 0, message_count: 2 },
      { type: 'G', last_viewed_at: 0, message_count: 3 },
      { type: 'D', last_viewed_at: 0, message_count: 2, is_muted: true },
      { type: 'D', last_viewed_at: 1000, message_count: 2, unread_eligible: false },
      { type: 'O', last_viewed_at: 1000, message_count: 1, mention_count: 5 },
    ];

    channels.forEach((channel) => {
      expect(getChannelUnreadMeta(channel).totalUnread).toBe(getChannelUnreadTotal(channel));
    });
  });
});
