import {
  appendDigit,
  backspaceBuffer,
  commitPercent,
  parseBufferPercent,
} from './percentKeypadUtils';

describe('percentKeypadUtils', () => {
  describe('parseBufferPercent', () => {
    it('treats an empty buffer as 0', () => {
      expect(parseBufferPercent('')).toBe(0);
    });

    it('parses a normal value', () => {
      expect(parseBufferPercent('73')).toBe(73);
    });

    it('clamps above 100 to 100', () => {
      expect(parseBufferPercent('150')).toBe(100);
    });

    it('returns 0 for non-numeric input', () => {
      expect(parseBufferPercent('abc')).toBe(0);
    });
  });

  describe('appendDigit', () => {
    it('appends to build a multi-digit value', () => {
      expect(appendDigit('7', 3)).toBe('73');
    });

    it('drops a leading zero so "0" + 7 reads as 7', () => {
      expect(appendDigit('0', 7)).toBe('7');
    });

    it('starts from empty', () => {
      expect(appendDigit('', 5)).toBe('5');
    });

    it('caps the result at 100', () => {
      expect(appendDigit('100', 5)).toBe('100');
      expect(appendDigit('99', 9)).toBe('100');
    });
  });

  describe('backspaceBuffer', () => {
    it('removes the last digit', () => {
      expect(backspaceBuffer('73')).toBe('7');
    });

    it('empties a single-digit buffer', () => {
      expect(backspaceBuffer('7')).toBe('');
    });

    it('is a no-op-safe on empty', () => {
      expect(backspaceBuffer('')).toBe('');
    });
  });

  describe('commitPercent', () => {
    it('raises a below-minimum value to the floor (fresh vote, min 1%)', () => {
      expect(commitPercent('0', 1)).toBe(1);
      expect(commitPercent('', 1)).toBe(1);
    });

    it('allows 0 when a vote exists and can be removed (min 0)', () => {
      expect(commitPercent('0', 0)).toBe(0);
    });

    it('keeps an in-range value', () => {
      expect(commitPercent('45', 1)).toBe(45);
    });

    it('still clamps the upper bound on commit', () => {
      expect(commitPercent('150', 1)).toBe(100);
    });
  });
});
