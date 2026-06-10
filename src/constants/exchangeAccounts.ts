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
// Mirrors vision-next's apps/web/src/consts/exchange-accounts.ts — keep in sync when
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
];

export const isExchangeAccount = (username?: string | null) =>
  !!username && EXCHANGE_ACCOUNTS.includes(username.trim().toLowerCase());
