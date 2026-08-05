// This document lets us mark which wallet operations can be repeatable
// directly from transaction/activities list

export const RepeatableTransfers: Partial<Record<string, boolean>> = {
  // Hive transfers
  transfer: true,
  // Ecency transfer
  outgoing_transfer_title: true,
  // Engine transfers
  tokens_transfer: true,
};
