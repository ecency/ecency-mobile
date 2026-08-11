import { earnsQuestContentCredit } from '@ecency/sdk';

export interface ShortReplyHintInput {
  isReply?: boolean;
  isEdit?: boolean;
  /** Signed-in account name, if any. */
  username?: string | null;
  /** Current composer body. */
  body?: string | null;
  /**
   * Whether `body` already earns credit, when the caller has computed it. The editor is
   * uncontrolled on purpose and only measures the body on a debounce, so it passes its
   * own answer in rather than have this recompute on every render. Omit it and this
   * measures `body` directly.
   */
  earnsCredit?: boolean;
}

/**
 * Whether to warn that this reply is too short to earn points or quest credit.
 *
 * The points backend drops a comment whose body is at or under a minimum length once
 * URLs are stripped, so "Thank you", an emoji, or an image-only reply earns nothing and
 * never reaches the daily comment quest. That rule is deliberate but invisible, and it
 * is the single biggest source of "quests do not show my action" reports.
 *
 * Replies only, matching the website. An edit never earns either (the original already
 * claimed the reward), a logged-out user has nothing to earn, and an untouched composer
 * should not be nagged at.
 */
export const shouldShowShortReplyHint = ({
  isReply,
  isEdit,
  username,
  body,
  earnsCredit,
}: ShortReplyHintInput): boolean => {
  if (!isReply || isEdit || !username) {
    return false;
  }

  if (!body?.trim()) {
    return false;
  }

  return !(earnsCredit ?? earnsQuestContentCredit(body));
};
