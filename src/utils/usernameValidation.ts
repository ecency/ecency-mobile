import { isExchangeLikeUsername } from '../constants/exchangeAccounts';

// Mirrors the blockchain's account-name rules (is_valid_account_name): 3-16
// chars total, dot-separated segments of 3+ chars, each starting with a letter,
// containing only lowercase letters, digits and single hyphens, and ending with
// a letter or digit. Expects already-lowercased input.
//
// `exchange` and `restricted` are policy checks layered on top of the chain
// rules: the name is chain-valid but too easily confused with a known exchange
// deposit account (`exchange`), or uses the "uid"-prefixed pattern abused for
// impersonation/phishing (`restricted`).
export type UsernameValidationError =
  | 'length'
  | 'start_letter'
  | 'symbols'
  | 'double_hyphens'
  | 'trailing_hyphen'
  | 'underscore'
  | 'exchange'
  | 'restricted';

// Maps a validation error to its react-intl message id. Kept beside the rule so
// every place that blocks a chain-invalid username (the register form AND the
// paid-account purchase) surfaces the same localized reason from one source.
export const USERNAME_ERROR_MESSAGE_IDS: Record<UsernameValidationError, string> = {
  length: 'register.validation.username_length_error',
  start_letter: 'register.validation.username_no_ascii_first_letter_error',
  symbols: 'register.validation.username_contains_symbols_error',
  double_hyphens: 'register.validation.username_contains_double_hyphens',
  // reuses the symbols message: a dedicated string would be missing from the
  // 38 non-en locale files until the next translation sync
  trailing_hyphen: 'register.validation.username_contains_symbols_error',
  underscore: 'register.validation.username_contains_underscore',
  exchange: 'register.validation.username_resembles_exchange',
  restricted: 'register.validation.username_restricted_prefix',
};

// Names of the form "uid" + digits (e.g. "uid12345") mimic the numeric user IDs
// that exchanges and services assign, and have been used to impersonate them.
// The check is separator/case-insensitive so "u.i.d.1"-style evasion still trips
// it, but plain words like "uidev" or "fluid" are left alone.
export const hasRestrictedUsernamePrefix = (value: string): boolean =>
  /^uid\d/.test(value.toLowerCase().replace(/[^a-z0-9]/g, ''));

const getSegmentError = (segment: string): UsernameValidationError | null => {
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
  return null;
};

export const getUsernameError = (value: string): UsernameValidationError | null => {
  if (!value || value.length < 3 || value.length > 16) {
    return 'length';
  }

  const segmentError =
    value
      .split('.')
      .map(getSegmentError)
      .find((error) => error !== null) ?? null;
  if (segmentError) {
    return segmentError;
  }

  // Checked last, after the chain-validity rules, so a malformed name shows its
  // format error first. Blocks names confusable with an exchange deposit account.
  if (isExchangeLikeUsername(value)) {
    return 'exchange';
  }

  // Blocks the "uid"-prefixed pattern commonly abused for impersonation/phishing.
  if (hasRestrictedUsernamePrefix(value)) {
    return 'restricted';
  }

  return null;
};
