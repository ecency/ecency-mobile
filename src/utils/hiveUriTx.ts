/**
 * The SDK's HiveTxTransaction.sign() assumes the wrapped transaction already
 * has a `signatures` array (it calls `transaction.signatures.push(...)`).
 *
 * A transaction produced by hive-uri's `resolveTransaction` is an unsigned
 * template with no `signatures` field, so handing it straight to the signer
 * crashes with "Cannot read property 'push' of undefined" when the user taps
 * Approve. Ensure the array exists before the tx reaches the signer.
 */
export const ensureSignableTx = (tx: any) => {
  if (tx && !Array.isArray(tx.signatures)) {
    tx.signatures = [];
  }
  return tx;
};
