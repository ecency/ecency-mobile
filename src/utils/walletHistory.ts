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
 * Deliberately absent: `escrow_*` and `cancel_transfer_from_savings` (groomed to an id
 * / "0", so they can never match a ticker) and `fill_transfer_from_savings` (the SDK's
 * HIVE and HBD `select` drops it regardless of what we request).
 */
const BASE_HISTORY_OPS: HiveOperationFilterValue[] = [
  'transfer',
  'transfer_to_savings',
  'transfer_from_savings',
  'recurrent_transfer',
  'fill_recurrent_transfer',
  'claim_reward_balance',
  'author_reward',
  'comment_benefactor_reward',
];

export const HIVE_LAYER_HISTORY_OPS: Record<string, HiveOperationFilterValue[]> = {
  HIVE: [...BASE_HISTORY_OPS, 'transfer_to_vesting', 'fill_order', 'fill_convert_request'],
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
 * Cursor for `condenser_api.get_account_history`.
 *
 * A page comes back in ASCENDING `num` order, so the OLDEST entry sits at index 0 and
 * paging backwards means `page[0].num - 1`. The SDK's own cursor reads the LAST element
 * (the newest), which walks the window back by a single operation per page -- 49 of 50
 * rows duplicated -- and, once `num` reaches 0, yields -1: the "newest" sentinel, which
 * restarts the walk at the head of the history and never terminates.
 */
export const getNextHistoryPageParam = (
  lastPage: { num?: number | string }[] | undefined,
): number | undefined => {
  if (!lastPage?.length) {
    return undefined;
  }

  const oldest = Number(lastPage[0]?.num ?? 0);
  return Number.isFinite(oldest) && oldest > 0 ? oldest - 1 : undefined;
};

/**
 * Does a groomed activity belong on the tab for `symbol`?
 *
 * `delegate_vesting_shares` and `fill_vesting_withdraw` keep their on-chain VESTS
 * denomination through grooming, so the HP tab has to accept both tickers or those rows
 * are silently dropped.
 */
export const matchesAssetTicker = (activity: CoinActivity | null, symbol: string): boolean => {
  if (!activity?.value) {
    return false;
  }

  const tickers = symbol === 'HP' ? ['HP', 'VESTS'] : [symbol];
  return tickers.some((ticker) => activity.value!.includes(ticker));
};
