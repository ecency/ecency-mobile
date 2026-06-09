import { get } from 'lodash';
import * as hiveuri from 'hive-uri';

// Hive operations whose payload carries a genuine fund recipient, mapped to the field
// that holds it. A QR is only allowed to seed a recipient from one of these — never
// from the first op of an arbitrary type (e.g. create_proposal.receiver,
// account_witness_vote.account), which would let a non-payment QR pre-fill an
// attacker-chosen account.
const RECIPIENT_OP_FIELDS: Record<string, string> = {
  transfer: 'to',
  recurrent_transfer: 'to',
  transfer_to_savings: 'to',
  transfer_to_vesting: 'to',
};

export const normalizeScannedUsername = (value?: string) =>
  (value || '').trim().replace(/^@/, '').toLowerCase();

export const extractUsernameFromScannedValue = (value: string) => {
  const scannedValue = value.trim();

  try {
    const decoded = hiveuri.decode(scannedValue);
    const operation = get(decoded, 'tx.operations[0]', []);
    const operationName = Array.isArray(operation) ? operation[0] : null;
    const operationPayload = Array.isArray(operation) ? operation[1] : null;
    const recipientField = operationName ? RECIPIENT_OP_FIELDS[operationName] : undefined;
    if (recipientField) {
      const username = get(operationPayload, recipientField);
      // hive-uri leaves unresolved placeholders (e.g. the signer slot) literal, so a
      // raw '__signer' is never a real recipient.
      if (username && username !== '__signer') {
        return normalizeScannedUsername(username);
      }
    }
  } catch {
    // Non hive-uri QR values are handled below.
  }

  const queryMatch = scannedValue.match(/[?&](?:to|username|account)=([^&#]+)/i);
  if (queryMatch?.[1]) {
    try {
      return normalizeScannedUsername(decodeURIComponent(queryMatch[1]));
    } catch {
      return normalizeScannedUsername(queryMatch[1]);
    }
  }

  const profileMatch =
    scannedValue.match(/(?:^|\/)@([a-z0-9.-]+)/i) ||
    scannedValue.match(/(?:^|\/)(?:profile|user|account)\/([a-z0-9.-]+)/i);
  if (profileMatch?.[1]) {
    return normalizeScannedUsername(profileMatch[1]);
  }

  const username = normalizeScannedUsername(scannedValue);
  return /^[a-z0-9.-]{3,16}$/.test(username) ? username : '';
};
