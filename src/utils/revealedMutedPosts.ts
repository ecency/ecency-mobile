/**
 * Session-scoped record of muted posts the user tapped to reveal in the feed.
 *
 * Mirrors `revealedImages`: kept in memory rather than component state so a
 * reveal survives FlashList cell recycling (state on the cell would otherwise
 * carry over to whichever post lands in the recycled cell next), and is not
 * persisted so a fresh session starts with the hint back in place.
 */
const revealedPosts = new Set<string>();
const listeners = new Set<() => void>();

export const getMutedPostKey = (author?: string, permlink?: string) =>
  author && permlink ? `${author}/${permlink}` : '';

export const revealMutedPost = (postKey?: string) => {
  if (!postKey || revealedPosts.has(postKey)) {
    return;
  }
  revealedPosts.add(postKey);
  listeners.forEach((listener) => listener());
};

export const isMutedPostRevealed = (postKey?: string) => !!postKey && revealedPosts.has(postKey);

export const subscribeToRevealedMutedPosts = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const clearRevealedMutedPosts = () => {
  revealedPosts.clear();
  listeners.forEach((listener) => listener());
};
