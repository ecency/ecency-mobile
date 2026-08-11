import { shouldShowShortContentHint } from './shortContentHint';

jest.mock('@ecency/sdk', () => ({
  // Mirrors the published rule: strip URLs, count code points, strictly greater than 25.
  earnsQuestContentCredit: (body?: string | null) =>
    Array.from((body ?? '').replace(/https?:\/\/\S+/g, '')).length > 25,
}));

const draft = (overrides: any = {}) => ({
  isEditing: false,
  username: 'alice',
  body: 'Thank you',
  ...overrides,
});

describe('shouldShowShortContentHint', () => {
  it('warns on the short replies the backend refuses', () => {
    expect(shouldShowShortContentHint(draft({ body: 'Thank you' }))).toBe(true);
    expect(shouldShowShortContentHint(draft({ body: 'Lol 😂' }))).toBe(true);
    expect(shouldShowShortContentHint(draft({ body: '❤️' }))).toBe(true);
  });

  it('counts a link-only reply as too short, matching the backend rule', () => {
    expect(
      shouldShowShortContentHint(draft({ body: 'https://i.example.com/a-very-long-url.gif' })),
    ).toBe(true);
  });

  it('stays quiet once the reply is long enough to earn', () => {
    expect(
      shouldShowShortContentHint(
        draft({ body: 'Thank you, this is a genuinely useful reply with something to say' }),
      ),
    ).toBe(false);
  });

  it('stays quiet on an untouched composer', () => {
    expect(shouldShowShortContentHint(draft({ body: '' }))).toBe(false);
    expect(shouldShowShortContentHint(draft({ body: '   ' }))).toBe(false);
    expect(shouldShowShortContentHint(draft({ body: undefined }))).toBe(false);
  });

  it('stays quiet when there is nothing to earn', () => {
    // An edit never earns again (the original claimed the reward) and a logged-out user
    // has nothing to earn. Reply-versus-wave is deliberately NOT gated here: every
    // caller is composing a comment, and the post editor keeps its own gate.
    expect(shouldShowShortContentHint(draft({ isEditing: true }))).toBe(false);
    expect(shouldShowShortContentHint(draft({ username: undefined }))).toBe(false);
    expect(shouldShowShortContentHint(draft({ username: '' }))).toBe(false);
  });

  it('applies to a wave the same way, since a wave is a comment on the chain', () => {
    expect(shouldShowShortContentHint(draft({ body: 'gm' }))).toBe(true);
    expect(
      shouldShowShortContentHint(draft({ body: 'gm everyone, hope the day treats you well' })),
    ).toBe(false);
  });

  it('trusts a caller-supplied verdict over measuring the body again', () => {
    // The editor is uncontrolled and measures on a debounce, so it passes its own
    // answer in. A stale-but-supplied `true` must win over the body.
    expect(shouldShowShortContentHint(draft({ body: 'Thank you', earnsCredit: true }))).toBe(false);
    expect(
      shouldShowShortContentHint(
        draft({ body: 'a genuinely long reply that clears the minimum', earnsCredit: false }),
      ),
    ).toBe(true);
  });
});
