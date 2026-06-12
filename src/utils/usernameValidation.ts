// Mirrors the blockchain's account-name rules (is_valid_account_name): 3-16
// chars total, dot-separated segments of 3+ chars, each starting with a letter,
// containing only lowercase letters, digits and single hyphens, and ending with
// a letter or digit. Expects already-lowercased input.
export type UsernameValidationError =
  | 'length'
  | 'start_letter'
  | 'symbols'
  | 'double_hyphens'
  | 'trailing_hyphen'
  | 'underscore';

export const getUsernameError = (value: string): UsernameValidationError | null => {
  if (!value || value.length < 3 || value.length > 16) {
    return 'length';
  }

  const segments = value.split('.');
  for (const segment of segments) {
    if (segment.length < 3) {
      return 'length';
    }
    if (segment.includes('_')) {
      return 'underscore';
    }
    if (!/^[a-z]/.test(segment)) {
      return 'start_letter';
    }
    if (segment.includes('--')) {
      return 'double_hyphens';
    }
    if (segment.endsWith('-')) {
      return 'trailing_hyphen';
    }
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(segment)) {
      return 'symbols';
    }
  }

  return null;
};
