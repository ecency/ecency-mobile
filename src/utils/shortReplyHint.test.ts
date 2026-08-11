import { shouldShowShortReplyHint } from './shortReplyHint';

jest.mock('@ecency/sdk', () => ({
  // Mirrors the published rule: strip URLs, count code points, strictly greater than 25.
  earnsQuestContentCredit: (body?: string | null) =>
    Array.from((body ?? '').replace(/https?:\/\/\S+/g, '')).length > 25,
}));

const reply = (overrides: any = {}) => ({
  isReply: true,
  isEdit: false,
  username: 'alice',
  body: 'Thank you',
  ...overrides,
});

describe('shouldShowShortReplyHint', () => {
  it('warns on the short replies the backend refuses', () => {
    expect(shouldShowShortReplyHint(reply({ body: 'Thank you' }))).toBe(true);
    expect(shouldShowShortReplyHint(reply({ body: 'Lol 😂' }))).toBe(true);
    expect(shouldShowShortReplyHint(reply({ body: '❤️' }))).toBe(true);
  });

  it('counts a link-only reply as too short, matching the backend rule', () => {
    expect(
      shouldShowShortReplyHint(reply({ body: 'https://i.example.com/a-very-long-url.gif' })),
    ).toBe(true);
  });

  it('stays quiet once the reply is long enough to earn', () => {
    expect(
      shouldShowShortReplyHint(
        reply({ body: 'Thank you, this is a genuinely useful reply with something to say' }),
      ),
    ).toBe(false);
  });

  it('stays quiet on an untouched composer', () => {
    expect(shouldShowShortReplyHint(reply({ body: '' }))).toBe(false);
    expect(shouldShowShortReplyHint(reply({ body: '   ' }))).toBe(false);
    expect(shouldShowShortReplyHint(reply({ body: undefined }))).toBe(false);
  });

  it('does not nag outside a fresh reply', () => {
    // A post is not gated on this in practice, an edit never earns again, and a
    // logged-out user has nothing to earn.
    expect(shouldShowShortReplyHint(reply({ isReply: false }))).toBe(false);
    expect(shouldShowShortReplyHint(reply({ isEdit: true }))).toBe(false);
    expect(shouldShowShortReplyHint(reply({ username: undefined }))).toBe(false);
    expect(shouldShowShortReplyHint(reply({ username: '' }))).toBe(false);
  });

  it('trusts a caller-supplied verdict over measuring the body again', () => {
    // The editor is uncontrolled and measures on a debounce, so it passes its own
    // answer in. A stale-but-supplied `true` must win over the body.
    expect(shouldShowShortReplyHint(reply({ body: 'Thank you', earnsCredit: true }))).toBe(false);
    expect(
      shouldShowShortReplyHint(
        reply({ body: 'a genuinely long reply that clears the minimum', earnsCredit: false }),
      ),
    ).toBe(true);
  });
});
