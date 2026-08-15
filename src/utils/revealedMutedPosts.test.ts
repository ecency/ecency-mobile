import {
  clearRevealedMutedPosts,
  getMutedPostKey,
  isMutedPostRevealed,
  revealMutedPost,
  subscribeToRevealedMutedPosts,
} from './revealedMutedPosts';

describe('revealedMutedPosts', () => {
  beforeEach(() => {
    clearRevealedMutedPosts();
  });

  it('builds a key only when both author and permlink are present', () => {
    expect(getMutedPostKey('offgridlife', 'good-night')).toBe('offgridlife/good-night');
    expect(getMutedPostKey('offgridlife', undefined)).toBe('');
    expect(getMutedPostKey(undefined, 'good-night')).toBe('');
  });

  it('reveals a single post without revealing the others', () => {
    revealMutedPost('alice/one');

    expect(isMutedPostRevealed('alice/one')).toBe(true);
    expect(isMutedPostRevealed('bob/two')).toBe(false);
  });

  it('treats an empty key as never revealed', () => {
    revealMutedPost('');

    expect(isMutedPostRevealed('')).toBe(false);
    expect(isMutedPostRevealed(undefined)).toBe(false);
  });

  it('notifies subscribers once per newly revealed post', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToRevealedMutedPosts(listener);

    revealMutedPost('alice/one');
    // Already revealed, so nothing changed and nothing to notify about.
    revealMutedPost('alice/one');

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    revealMutedPost('bob/two');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('clears reveals so a fresh session starts dimmed again', () => {
    revealMutedPost('alice/one');
    clearRevealedMutedPosts();

    expect(isMutedPostRevealed('alice/one')).toBe(false);
  });
});
