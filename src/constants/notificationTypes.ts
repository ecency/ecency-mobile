/**
 * Notification type vocabularies.
 *
 * enotify speaks TWO different sets of strings for the same events, and mixing them up
 * is a silent failure rather than an error:
 *
 *  - PUSH (FCM `data.type`) comes from `push/format.py` `custom_data['type']` and is
 *    SINGULAR for two of them: `delegation`, `payout`, plus `favorite` / `bookmark`.
 *  - WEBSOCKET (`wsData.type`) comes from `helper.py` `str_activity_type()` and is
 *    PLURAL: `delegations`, `payouts`, `favorites`, `bookmarks`.
 *
 * The foreground FCM allowlist previously held the websocket spellings, so delegation
 * and payout pushes never matched it and the unread badge went stale for them.
 *
 * The follow family (`follow`, `unfollow`, `ignore`, `blacklist`) spells the same in
 * both. `blacklist` is websocket-only: it has no push template server side, so it is
 * never enqueued for FCM.
 */

/** Types the foreground FCM listener reacts to. PUSH vocabulary. */
export const FCM_FOREGROUND_NOTIFICATION_TYPES = [
  'mention',
  'reply',
  'transfer',
  'delegation',
  'scheduled_published',
  'payout',
  'account_update',
  'weekly_earnings',
  'follow',
  'unfollow',
  'ignore',
] as const;

/** Types the enotify websocket bridge reacts to. WEBSOCKET vocabulary. */
export const WS_NOTIFICATION_TYPES = [
  'mention',
  'reply',
  'transfer',
  'delegations',
  'scheduled_published',
  'payouts',
  'account_update',
  'weekly_earnings',
  'follow',
  'unfollow',
  'ignore',
  'blacklist',
] as const;

/** Follow-family types, which route to the actor's profile rather than to a post. */
export const FOLLOW_NOTIFICATION_TYPES = ['follow', 'unfollow', 'ignore', 'blacklist'] as const;
