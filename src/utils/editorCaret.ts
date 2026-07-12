/**
 * Decide where the caret goes when a body is first loaded into the editor.
 *
 * When a caret was previously saved for this target we resume there, clamped to
 * the current body length (the body may have shrunk since it was saved). When no
 * caret was saved (a legacy draft, one created on another device, or the first
 * open after this shipped) the fallback depends on the surface:
 *  - a post/draft/edit falls back to the TOP (0) so a long body opens at its
 *    start instead of scrolling to the bottom (the reported bug), and
 *  - a reply falls back to the END so a cached comment is appended to rather than
 *    prepended (reply bodies are short, so there is no scroll problem).
 *
 * `hasSavedCaret` is returned so the caller can decide whether to keep the body
 * focused: with no saved caret on a post/draft we intentionally blur so an
 * auto-focused caret at 0 can't prepend on the next keystroke.
 *
 * Kept dependency-free so it can be unit-tested without the editor's heavy module
 * graph. This logic has been flipped twice historically; the tests lock it down.
 */
export const resolveRestoreCaret = (
  savedCaret: number | undefined,
  bodyLength: number,
  isReply: boolean,
): { caret: number; hasSavedCaret: boolean } => {
  const hasSavedCaret = typeof savedCaret === 'number';
  const fallbackCaret = isReply ? bodyLength : 0;
  const caret = hasSavedCaret ? Math.min(savedCaret as number, bodyLength) : fallbackCaret;
  return { caret, hasSavedCaret };
};
