// Known Hive exchange deposit accounts.
//
// Exchanges credit a deposit only when they observe a plain `transfer` operation
// whose memo identifies the user's account. Two failure modes follow:
//   1. A missing memo on a HIVE/HBD send means the deposit can't be attributed and
//      the funds are typically lost.
//   2. A `recurrent_transfer` settles through `fill_recurrent_transfer` *virtual*
//      operations, which exchange deposit systems do not monitor, so recurring
//      sends to an exchange may never be credited.
//
// Mirrors vision-web's apps/web/src/consts/exchange-accounts.ts — keep in sync when
// the web list changes.
export const EXCHANGE_ACCOUNTS = [
  'deepcrypto8',
  'gateiodeposit',
  'probithive',
  'mxchive',
  'huobi-pro',
  'coinexdeposit',
  'bittrex',
  'blocktrades',
  'changelly',
  'gopax-deposit',
  'hitbtc-exchange',
  'poloniex',
  'upbit-exchange',
  'onepagex',
  'bdhivesteem',
  'bitgethive',
];

export const isExchangeAccount = (username?: string | null) =>
  !!username && EXCHANGE_ACCOUNTS.includes(username.trim().toLowerCase());

// Strip everything but lowercase letters and digits so separator-only variations
// ('huobi-pro' vs 'huobipro') and casing collapse to the same comparable form.
const normalizeForExchangeMatch = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

// Generic tails that exchanges append to a brand when naming a deposit account.
const GENERIC_EXCHANGE_SUFFIXES = ['deposit', 'exchange', 'steem', 'hive', 'pro'];

// Reduce a normalized account name to its distinctive brand, dropping a trailing
// generic suffix and trailing digits ('gateiodeposit' -> 'gateio',
// 'deepcrypto8' -> 'deepcrypto'). Single-token names without such a tail
// ('bittrex', 'blocktrades', 'changelly') are returned unchanged, so their
// ordinary-word prefixes ('block', 'change') never become a match target.
// Strips a single (outermost) suffix, which covers every account in the current
// list; a future account with a compounded tail (e.g. 'brandproexchange') would
// need this extended to strip iteratively.
const exchangeBrandCore = (normalized: string): string => {
  const core = normalized.replace(/\d+$/, '');
  const suffix = GENERIC_EXCHANGE_SUFFIXES.find((s) => core.length > s.length && core.endsWith(s));
  return suffix ? core.slice(0, -suffix.length) : core;
};

// Classic iterative Levenshtein (single rolling row) for short username strings.
const levenshtein = (a: string, b: string): number => {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      curr.push(Math.min(prev[j + 1] + 1, curr[j] + 1, prev[j] + cost));
    }
    prev = curr;
  }
  return prev[b.length];
};

/**
 * True when `username` is identical or close enough to a known exchange deposit
 * account that it could be mistaken for one. Matching is intentionally
 * conservative to avoid false positives on ordinary names:
 *   1. exact match against the full account or its brand core, ignoring
 *      separators/casing ('huobi-pro' ~ 'huobipro', 'coinex' -> coinexdeposit);
 *   2. the chosen name embeds the full account name ('mybittrex') or, when the
 *      brand is distinct from the full name, the brand core ('upbitcoin');
 *   3. a single-character typo of the full account name ('bittrx').
 *
 * Mirrors vision-web's isExchangeLikeUsername — keep the two in sync.
 */
export const isExchangeLikeUsername = (username?: string | null): boolean => {
  if (!username) {
    return false;
  }
  const candidate = normalizeForExchangeMatch(username);
  // Cheap early-out for 1-2 char inputs; anything still short simply fails every
  // rule below (brand cores are >= 4, full names >= 7, embed/typo need length).
  if (candidate.length < 3) {
    return false;
  }

  return EXCHANGE_ACCOUNTS.some((account) => {
    const exchange = normalizeForExchangeMatch(account);
    if (!exchange) {
      return false;
    }
    const core = exchangeBrandCore(exchange);

    // 1. exact match against the full account or its (>= 4 char) brand core.
    //    The >= 4 guard drops the only sub-4 core ('mxc', from 'mxchive'), so a
    //    3-char fragment can't over-match; 'mxchive' is still caught in full.
    if (candidate === exchange) {
      return true;
    }
    if (core.length >= 4 && candidate === core) {
      return true;
    }
    // 2. the chosen name wraps the whole account name, or the distinct brand core
    if (candidate.length > exchange.length && candidate.includes(exchange)) {
      return true;
    }
    if (
      core !== exchange &&
      core.length >= 4 &&
      candidate.length > core.length &&
      candidate.includes(core)
    ) {
      return true;
    }
    // 3. single-character typo of the full account name at comparable length
    if (
      Math.abs(candidate.length - exchange.length) <= 1 &&
      levenshtein(candidate, exchange) <= 1
    ) {
      return true;
    }

    return false;
  });
};
