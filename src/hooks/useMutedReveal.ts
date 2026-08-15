import { useCallback, useSyncExternalStore } from 'react';
import {
  getMutedPostKey,
  isMutedPostRevealed,
  revealMutedPost,
  subscribeToRevealedMutedPosts,
} from '../utils/revealedMutedPosts';

/**
 * Gates the dimmed treatment of a muted post card behind a tap, matching web:
 * the content is never hidden, only dimmed with a hint above it until the user
 * taps the hint.
 *
 * `isDimmed` is true while the post is muted and this particular post has not
 * been revealed yet.
 */
export const useMutedReveal = (isMuted: boolean, author?: string, permlink?: string) => {
  const postKey = getMutedPostKey(author, permlink);

  const isRevealed = useSyncExternalStore(
    subscribeToRevealedMutedPosts,
    // Snapshot is a boolean scoped to this post, so revealing one card does not
    // re-render every other card on screen.
    () => isMutedPostRevealed(postKey),
  );

  const reveal = useCallback(() => revealMutedPost(postKey), [postKey]);

  return { isDimmed: isMuted && !isRevealed, reveal };
};
