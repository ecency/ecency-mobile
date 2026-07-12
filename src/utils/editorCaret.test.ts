import { resolveRestoreCaret } from './editorCaret';

describe('resolveRestoreCaret', () => {
  describe('no saved caret (legacy / cross-device / first open)', () => {
    it('falls back to the TOP (0) for a post/draft so a long body opens at its start', () => {
      // Regression guard for melinda010100: opening a saved draft must NOT land at
      // the end of the body (which scrolled the editor to the bottom).
      expect(resolveRestoreCaret(undefined, 5000, false)).toEqual({
        caret: 0,
        hasSavedCaret: false,
      });
    });

    it('falls back to the END for a reply so a cached comment is appended, not prepended', () => {
      expect(resolveRestoreCaret(undefined, 320, true)).toEqual({
        caret: 320,
        hasSavedCaret: false,
      });
    });

    it('top fallback is 0 even for an empty post body', () => {
      expect(resolveRestoreCaret(undefined, 0, false)).toEqual({ caret: 0, hasSavedCaret: false });
    });
  });

  describe('with a saved caret', () => {
    it('resumes at the saved offset for a post/draft', () => {
      expect(resolveRestoreCaret(30, 5000, false)).toEqual({ caret: 30, hasSavedCaret: true });
    });

    it('resumes at the saved offset for a reply', () => {
      expect(resolveRestoreCaret(12, 320, true)).toEqual({ caret: 12, hasSavedCaret: true });
    });

    it('clamps a stale saved caret to the current (shrunk) body length', () => {
      expect(resolveRestoreCaret(99999, 500, false)).toEqual({ caret: 500, hasSavedCaret: true });
    });

    // A saved caret of 0 must count as present, not fall through to the reply-end fallback.
    it('treats a saved caret of 0 as present', () => {
      expect(resolveRestoreCaret(0, 320, true)).toEqual({ caret: 0, hasSavedCaret: true });
    });
  });
});
