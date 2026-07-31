import { getChannelUnreadTotal } from './mattermost';

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
});
