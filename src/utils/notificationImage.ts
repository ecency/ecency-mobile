import { proxifyImageSrc } from '@ecency/render-helper';

// The 32pt slot in the notification row, at up to 3x pixel density.
const THUMB_SIZE = 96;

// Types whose image is the post the notification is about: the post you were
// mentioned in, the one that was reblogged, the one that just went live.
//
// Vote notifications also carry img_url, but they are by far the highest-volume
// type and every thumbnail would be a repeat of the user's own post, so they are
// deliberately left text-only.
const IMAGE_TYPES = ['mention', 'reblog', 'scheduled_published', 'favorites', 'payouts'];

// Types whose image hangs off the PARENT post, because the notification itself is
// about a comment: your post that was replied to, or the post you bookmarked that
// someone has now commented on. Either way the parent is the useful context.
const PARENT_IMAGE_TYPES = ['reply', 'bookmarks'];

/**
 * Thumbnail for a notification row, or null when the notification has no post
 * image to show.
 *
 * The API hands back the post's raw `json_metadata` image, which can be a
 * full-size original, so it is proxied down to the size actually rendered.
 */
export const getNotificationImageUrl = (notification: any): string | null => {
  const rawUrl = PARENT_IMAGE_TYPES.includes(notification?.type)
    ? notification?.parent_img_url
    : IMAGE_TYPES.includes(notification?.type)
    ? notification?.img_url
    : null;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  return proxifyImageSrc(rawUrl, THUMB_SIZE, THUMB_SIZE, 'match');
};
