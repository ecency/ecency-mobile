import { earnsQuestContentCredit } from '@ecency/sdk';

export interface ShortContentHintInput {
  /** Signed-in account name, if any. */
  username?: string | null;
  /** Editing existing content rather than creating new content. */
  isEditing?: boolean;
  /** Current composer body. */
  body?: string | null;
  /**
   * Whether `body` already earns credit, when the caller has computed it. The post/reply
   * editor is uncontrolled on purpose and only measures the body on a debounce, so it
   * passes its own answer in rather than have this recompute on every render. Omit it and
   * this measures `body` directly.
   */
  earnsCredit?: boolean;
}

/**
 * Whether to warn that this content is too short to earn points or quest credit.
 *
 * The points backend drops a comment whose body is at or under a minimum length once
 * URLs are stripped, so "Thank you", an emoji, or an image-only body earns nothing and
 * never reaches the daily comment quest. That rule is deliberate but invisible, and it
 * is the single biggest source of "quests do not show my action" reports.
 *
 * Shared by the reply editor and the quick post composer, because a wave is a comment on
 * the chain and goes through exactly the same rule. Kept in one place so the two cannot
 * drift apart on a rule the backend owns.
 *
 * Deliberately does NOT gate on reply-versus-wave: every caller here is composing a
 * comment. The post editor keeps its own `isReply` gate at the call site, since a post
 * long enough to trip this is not a real case and would only be noise there.
 *
 * Quiet for logged-out users (nothing to earn), while editing (the original already
 * claimed the reward), and on an untouched composer (nothing to nag about yet).
 */
export const shouldShowShortContentHint = ({
  username,
  isEditing,
  body,
  earnsCredit,
}: ShortContentHintInput): boolean => {
  if (!username || isEditing) {
    return false;
  }

  if (!body?.trim()) {
    return false;
  }

  return !(earnsCredit ?? earnsQuestContentCredit(body));
};
