import { DigestType } from '@ecency/sdk';
import { isCommunity } from '../../utils/communityValidation';

export interface PostDigestTarget {
  type: DigestType;
  target: string;
}

/**
 * Which digest an end-of-post card offers, mirroring the website: a reader is
 * offered the AUTHOR's creator digest; the author reading their own COMMUNITY
 * post is offered the community's digest (the list that would carry this
 * post); the author's own non-community post offers nothing. Comments and
 * anonymous viewers offer nothing (mobile subscribes are signed-in only).
 */
export const pickPostDigestTarget = (
  post:
    | { author?: string; category?: string; parent_author?: string; depth?: number }
    | null
    | undefined,
  viewer: string | null | undefined,
): PostDigestTarget | null => {
  if (!post?.author || !viewer) {
    return null;
  }
  const isRoot = !post.parent_author && !(typeof post.depth === 'number' && post.depth > 0);
  if (!isRoot) {
    return null;
  }
  const community = post.category && isCommunity(post.category) ? post.category : null;
  if (viewer === post.author) {
    return community ? { type: 'community', target: community } : null;
  }
  return { type: 'creator', target: post.author };
};

/** Per viewer AND list, so dismissing one author's card never hides another's. */
export const postPromptStorageKey = (viewer: string, type: string, target: string) =>
  `digest_post_prompt_${viewer}_${type}_${target}`;
