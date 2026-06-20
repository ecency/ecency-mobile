import type { Operation } from '@ecency/sdk';

/**
 * Operations that, under current Hive consensus, can be signed with the
 * posting authority. Everything not listed (and not special-cased below)
 * defaults to active.
 */
export const POSTING_AUTH_OPERATION_NAMES = new Set([
  'vote',
  'comment',
  'comment_options',
  'custom_json',
  'delete_comment',
  'claim_reward_balance',
]);

/**
 * Resolve the authority required to sign a single operation.
 *
 * Special cases mirror Hive consensus so valid hive-uri hot links are signed
 * with the correct key instead of falling back to active:
 * - `custom_json`: posting unless it declares `required_auths` (then active).
 * - `account_update2`: posting when it only changes `posting_json_metadata`
 *   (the common profile/pin update); active if it also changes `json_metadata`
 *   or any key/authority (`owner`, `active`, `posting`, `memo_key`).
 * - `account_update` (v1) is not listed, so it correctly resolves to active.
 */
export const resolveOperationAuthority = (operation: Operation): 'posting' | 'active' => {
  const [operationName, payload] = operation as [string, any];

  if (operationName === 'custom_json') {
    return Array.isArray(payload?.required_auths) && payload.required_auths.length > 0
      ? 'active'
      : 'posting';
  }

  if (operationName === 'account_update2') {
    const changesAuthorityOrKeys =
      payload?.owner != null ||
      payload?.active != null ||
      payload?.posting != null ||
      payload?.memo_key != null ||
      (typeof payload?.json_metadata === 'string' && payload.json_metadata.length > 0);
    return changesAuthorityOrKeys ? 'active' : 'posting';
  }

  return POSTING_AUTH_OPERATION_NAMES.has(operationName) ? 'posting' : 'active';
};

/**
 * Resolve the single authority required to sign a whole transaction. If any
 * operation needs active, the transaction needs active.
 */
export const resolveTxRequiredAuthority = (operations: Operation[]): 'posting' | 'active' => {
  // operations comes from deeplink-derived `tx` typed as `any`, so guard against
  // a non-array payload before calling .some().
  if (!Array.isArray(operations) || operations.length === 0) {
    return 'posting';
  }

  return operations.some((operation) => resolveOperationAuthority(operation) === 'active')
    ? 'active'
    : 'posting';
};
