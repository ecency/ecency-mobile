/*
 * Pure helpers for the vote-percent keypad (percentKeypad.tsx). Kept separate so
 * the digit-buffer / clamping behaviour can be unit-tested without rendering.
 *
 * A "buffer" is the raw string of typed digits (e.g. "7", "73", ""). Percent is
 * a whole number 0..100 (the on-chain vote weight is whole-percent, so there is
 * no sub-percent state to track).
 */

export const MAX_PERCENT = 100;

// Parse a digit buffer to a whole percent, clamped to the UPPER bound only.
// The lower bound is intentionally not applied here so the user can transit
// through 0 while typing (e.g. "0" then "7" -> 7); it is enforced on commit.
export const parseBufferPercent = (buffer: string): number => {
  const n = buffer === '' ? 0 : parseInt(buffer, 10);
  if (Number.isNaN(n)) {
    return 0;
  }
  return Math.min(MAX_PERCENT, Math.max(0, n));
};

// Append a digit, dropping a leading zero ("0" + 7 -> "7") and capping at 100.
// Returns the normalised buffer string.
export const appendDigit = (buffer: string, digit: number): string => {
  const raw = buffer === '0' ? String(digit) : `${buffer}${digit}`;
  return String(parseBufferPercent(raw));
};

export const backspaceBuffer = (buffer: string): string => buffer.slice(0, -1);

// Final value when the user commits (Done): enforce the lower bound (1% for a
// fresh vote, 0 when a vote already exists and can be removed).
export const commitPercent = (buffer: string, minPercent: number): number =>
  Math.max(minPercent, parseBufferPercent(buffer));
