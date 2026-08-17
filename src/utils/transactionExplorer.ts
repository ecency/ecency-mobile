/**
 * Turning a wallet activity into a link someone else can verify.
 *
 * Not every row has a transaction behind it, and the ones that do not are the majority on
 * some tabs, so the caller has to be able to tell them apart rather than build a link that
 * resolves to nothing:
 *
 * - A virtual operation (`author_reward`, `curation_reward`, `fill_order`, ...) is emitted
 *   by the chain instead of broadcast, and `condenser_api.get_account_history` gives it a
 *   `trx_id` of 40 zeroes.
 * - A Hive Engine row carries `<hive-trx-id>-<op index>` when it rode in on a custom_json,
 *   and `<block>-<index>` when a contract generated it with no Hive transaction at all.
 *   Both shapes appear in the same account's history (184 of 500 rows on the account this
 *   was written against).
 */

const EXPLORER_BASE = 'https://hivexplorer.com';

/** A Hive transaction id is 40 hex characters. All zeroes is the "no transaction" marker. */
const TRX_ID_PATTERN = /^[0-9a-f]{40}$/i;

/** Hive Engine appends the operation's index within the transaction. */
const OP_INDEX_SUFFIX = /-\d+$/;

/**
 * The Hive transaction id behind an activity, or undefined when it has none.
 */
export const resolveTrxId = (rawId?: string | null): string | undefined => {
  const candidate = String(rawId ?? '')
    .trim()
    .replace(OP_INDEX_SUFFIX, '');

  if (!TRX_ID_PATTERN.test(candidate) || /^0+$/.test(candidate)) {
    return undefined;
  }

  return candidate.toLowerCase();
};

/**
 * The explorer link for an already-resolved transaction id.
 */
export const getTransactionExplorerUrl = (trxId?: string | null): string | undefined => {
  const resolved = resolveTrxId(trxId);
  return resolved ? `${EXPLORER_BASE}/tx/${resolved}` : undefined;
};
