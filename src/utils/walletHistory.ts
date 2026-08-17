import type { HiveOperationFilterValue } from '@ecency/sdk';
import { CoinActivity } from '../redux/reducers/walletReducer';

/**
 * Pure helpers backing the Hive-layer wallet history (`useActivitiesQuery`).
 *
 * They live outside `walletQueries.ts` so they can be unit tested without pulling in
 * React, redux and the whole SDK query surface.
 */

/**
 * Operations requested per token, resolved by the SDK into a server-side bitmask.
 *
 * Each list is exactly the set that survives all three downstream filters -- the SDK's
 * per-asset `select`, `transferTypes` in `./wallet`, and `matchesAssetTicker` below --
 * so no operation is fetched only to be discarded on device. That matters: asking for
 * every operation (the previous behaviour) means a witness account's newest page of 50
 * is ~92% `producer_reward`, which `transferTypes` drops, leaving the HIVE and HBD
 * history empty on an HTTP 200.
 *
 * Deliberately absent: `escrow_*` and `cancel_transfer_from_savings`, groomed to an id
 * / "0", so they can never match a ticker.
 */
const BASE_HISTORY_OPS: HiveOperationFilterValue[] = [
  'transfer',
  'transfer_to_savings',
  'transfer_from_savings',
  // The virtual op that lands when a savings withdrawal's timer completes. Requestable
  // since @ecency/sdk 2.3.80: before that the HIVE and HBD `select` discarded it however
  // it was asked for, and the operation was missing from the SDK's transfers group.
  'fill_transfer_from_savings',
  'recurrent_transfer',
  'fill_recurrent_transfer',
  'claim_reward_balance',
  'author_reward',
  'comment_benefactor_reward',
];

export const HIVE_LAYER_HISTORY_OPS: Record<string, HiveOperationFilterValue[]> = {
  HIVE: [
    ...BASE_HISTORY_OPS,
    'transfer_to_vesting',
    // A power-down installment pays out in HIVE, so it belongs on this tab too. The
    // routed-to-vesting variant denominates `deposited` in VESTS and is filtered out
    // here by the ticker match, landing on HP instead.
    'fill_vesting_withdraw',
    'fill_order',
    'fill_convert_request',
  ],
  HBD: [...BASE_HISTORY_OPS, 'fill_order', 'fill_convert_request'],
  HP: [
    'claim_reward_balance',
    'author_reward',
    'comment_benefactor_reward',
    'curation_reward',
    'transfer_to_vesting',
    'withdraw_vesting',
    'fill_vesting_withdraw',
    'delegate_vesting_shares',
  ],
};

export const getHistoryOpsForSymbol = (symbol: string): HiveOperationFilterValue[] =>
  HIVE_LAYER_HISTORY_OPS[symbol] ?? HIVE_LAYER_HISTORY_OPS.HIVE;

/**
 * Operations that belong to a tab structurally rather than by denomination. A power-up
 * is an HP event, but its groomed value is the HIVE amount that went in, so a ticker
 * match alone would drop it from the HP tab.
 */
const STRUCTURAL_OPS: Record<string, string[]> = {
  HP: ['transfer_to_vesting'],
};

/**
 * Does a groomed activity belong on the tab for `symbol`?
 *
 * `delegate_vesting_shares` and the routed variant of `fill_vesting_withdraw` keep their
 * on-chain VESTS denomination through grooming, so the HP tab has to accept both tickers
 * or those rows are silently dropped.
 */
export const matchesAssetTicker = (activity: CoinActivity | null, symbol: string): boolean => {
  if (!activity?.value) {
    return false;
  }

  if (STRUCTURAL_OPS[symbol]?.includes(activity.textKey ?? '')) {
    return true;
  }

  const tickers = symbol === 'HP' ? ['HP', 'VESTS'] : [symbol];
  return tickers.some((ticker) => activity.value!.includes(ticker));
};

/**
 * Newest first, no repeats.
 *
 * `condenser_api.get_account_history` answers a page in ASCENDING `num` order, so the
 * OLDEST operation of the window arrives at index 0 and rendering a page as it lands puts
 * two-day-old rows above today's. Paging compounds it: the next page is an older window
 * appended at the END, itself ascending, so the list reads old->new, then older->newer.
 * Both of those read to a user as "the wallet stopped updating", since nothing is
 * actually missing and refreshing changes nothing they can see.
 *
 * `num` (groomed to `trxIndex`) is unique and monotonic per account, so it orders exactly
 * with no timestamp ties to break, and it doubles as the dedupe key. The web wallet sorts
 * the same field the same way.
 */
export const orderChainActivities = (activities: CoinActivity[]): CoinActivity[] => {
  const byTrxIndex = new Map<number, CoinActivity>();

  activities.forEach((activity) => {
    if (!byTrxIndex.has(activity.trxIndex)) {
      byTrxIndex.set(activity.trxIndex, activity);
    }
  });

  return [...byTrxIndex.values()].sort((a, b) => Number(b.trxIndex) - Number(a.trxIndex));
};
