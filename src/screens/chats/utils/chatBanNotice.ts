/**
 * Copy for a chat ban, mirroring the web client's `chat-ban-notice.ts`.
 *
 * The API sends `bannedUntil` (epoch ms) and an optional `reason`, and deliberately does not send
 * display text: the remaining time must be computed at render so it counts down, and the wording
 * must be translatable. The server's own `error` string is operator-facing — it names the account
 * and quotes an ISO timestamp — and must never be shown to the person who is banned.
 *
 * The bands and wording are kept identical to web on purpose. Two clients explaining the same
 * moderation action differently is worse than either wording alone.
 */

/** Matches react-intl's formatMessage, but injectable so this stays a pure, testable unit. */
export type BanMessageFormatter = (
  descriptor: { id: string; defaultMessage: string },
  values?: Record<string, string | number>,
) => string;

export interface ChatBanInfo {
  bannedUntil: number;
  reason?: string;
}

/** Extracts ban info from a thrown request error, or null when it isn't a live ban. */
export const getChatBanInfo = (error: any, now: number = Date.now()): ChatBanInfo | null => {
  const bannedUntil = Number(error?.bannedUntil);

  // isFinite, not isNaN: Infinity survives an isNaN check and is also > now, so it would render
  // an endless duration and never fire onExpire. Returning null sends the caller down its
  // existing fallback path instead.
  if (!error?.bannedUntil || !Number.isFinite(bannedUntil) || bannedUntil <= now) {
    return null;
  }

  return {
    bannedUntil,
    reason: typeof error.reason === 'string' ? error.reason : undefined,
  };
};

/**
 * Coarse remaining time, rounded up. Each band hands `count` a value of 2 or more, so no phrasing
 * can come out as "1 hours" and these stay plain keys rather than needing plural variants.
 */
export const formatBanRemaining = (
  bannedUntil: number,
  now: number,
  formatMessage: BanMessageFormatter,
): string => {
  const ms = Math.max(0, bannedUntil - now);
  const minutes = Math.ceil(ms / 60000);

  if (minutes <= 1) {
    return formatMessage({
      id: 'chats.ban-remaining-soon',
      defaultMessage: 'in under a minute',
    });
  }

  if (minutes < 90) {
    return formatMessage(
      { id: 'chats.ban-remaining-minutes', defaultMessage: 'in about {count} minutes' },
      { count: minutes },
    );
  }

  const hours = Math.round(ms / 3600000);
  if (hours < 48) {
    return formatMessage(
      { id: 'chats.ban-remaining-hours', defaultMessage: 'in about {count} hours' },
      { count: hours },
    );
  }

  return formatMessage(
    { id: 'chats.ban-remaining-days', defaultMessage: 'in about {count} days' },
    { count: Math.round(ms / 86400000) },
  );
};

/** The reason sentence. Never names detection thresholds or the underlying prop. */
const reasonSentence = (reason: string | undefined, formatMessage: BanMessageFormatter): string => {
  switch (reason) {
    case 'spray':
      return formatMessage({
        id: 'chats.ban-reason-spray',
        defaultMessage:
          "You're paused from posting because the same message went to several channels at once.",
      });
    case 'mass-dm':
      return formatMessage({
        id: 'chats.ban-reason-mass-dm',
        defaultMessage:
          "You're paused from posting because a message was sent to many people at once.",
      });
    default:
      // Covers 'manual' and any reason a newer moderation service adds that this build predates.
      return formatMessage({
        id: 'chats.ban-reason-generic',
        defaultMessage: "You're paused from posting in chat.",
      });
  }
};

/** Full notice: what happened, that reading still works, and when it lifts. */
export const formatChatBanNotice = (
  info: ChatBanInfo,
  now: number,
  formatMessage: BanMessageFormatter,
): string => {
  const stillReadable = formatMessage({
    id: 'chats.ban-can-still-read',
    defaultMessage: 'You can still read chat.',
  });
  const unlocks = formatMessage(
    { id: 'chats.ban-unlocks', defaultMessage: 'Posting unlocks {when}.' },
    { when: formatBanRemaining(info.bannedUntil, now, formatMessage) },
  );

  return `${reasonSentence(info.reason, formatMessage)} ${stillReadable} ${unlocks}`;
};

/** Bounded tick for the live notice. Never derive a timer delay from `bannedUntil`: setTimeout
 *  takes a 32-bit signed delay, so a multi-year ban would fire almost immediately. */
export const BAN_NOTICE_TICK_MS = 30000;
