import { proxifyImageSrc } from '@ecency/render-helper';

// The 32pt slot in the notification row, at up to 3x pixel density.
const THUMB_SIZE = 96;

// Vote notifications also carry img_url, but they are by far the highest-volume
// type and every thumbnail would be a repeat of the user's own post, so they are
// deliberately left text-only.
const IMAGE_TYPES = ['mention', 'reblog', 'scheduled_published'];

/**
 * Thumbnail for a notification row, or null when the notification has no post
 * image to show.
 *
 * The API hands back the post's raw `json_metadata` image, which can be a
 * full-size original, so it is proxied down to the size actually rendered.
 */
export const getNotificationImageUrl = (notification: any): string | null => {
  // A reply points at the parent post, i.e. the user's own post that was replied
  // to, which is the context that makes the row readable.
  const rawUrl =
    notification?.type === 'reply'
      ? notification?.parent_img_url
      : IMAGE_TYPES.includes(notification?.type)
      ? notification?.img_url
      : null;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  return proxifyImageSrc(rawUrl, THUMB_SIZE, THUMB_SIZE, 'match');
};
