import get from 'lodash/get';
import TransferTypes from '../constants/transferTypes';

/**
 * Normalize legacy/route transfer-type aliases to canonical Hive operation names.
 * Shared by the wallet navigation path and the transfer container so both agree on
 * a single mapping instead of re-deriving it inline.
 */
export const normalizeTransferType = (transferType) => {
  switch (transferType) {
    case 'transfer_token':
      return TransferTypes.TRANSFER;
    case 'withdraw_hive':
    case 'withdraw_hbd':
      return TransferTypes.TRANSFER_FROM_SAVINGS;
    default:
      return transferType;
  }
};

export const parseAccountAssetBalance = (value, fundType) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const parsed = Number(String(value).replace(fundType, '').trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getNativeAccountBalance = (account, transferType, fundType) => {
  if (!account) {
    return undefined;
  }

  const normalizedTransferType = normalizeTransferType(transferType);

  if (fundType === 'HIVE') {
    if (normalizedTransferType === TransferTypes.TRANSFER_FROM_SAVINGS) {
      return parseAccountAssetBalance(
        get(account, 'savings_balance') ?? get(account, 'savingBalance'),
        fundType,
      );
    }

    if (
      normalizedTransferType === TransferTypes.TRANSFER ||
      normalizedTransferType === TransferTypes.RECURRENT_TRANSFER ||
      normalizedTransferType === TransferTypes.TRANSFER_TO_SAVINGS ||
      normalizedTransferType === TransferTypes.TRANSFER_TO_VESTING ||
      transferType === 'purchase_estm'
    ) {
      return parseAccountAssetBalance(get(account, 'balance'), fundType);
    }
  }

  if (fundType === 'HBD') {
    if (normalizedTransferType === TransferTypes.TRANSFER_FROM_SAVINGS) {
      return parseAccountAssetBalance(
        get(account, 'savings_hbd_balance') ?? get(account, 'savingBalanceHbd'),
        fundType,
      );
    }

    if (
      normalizedTransferType === TransferTypes.TRANSFER ||
      normalizedTransferType === TransferTypes.RECURRENT_TRANSFER ||
      normalizedTransferType === TransferTypes.CONVERT ||
      normalizedTransferType === TransferTypes.TRANSFER_TO_SAVINGS ||
      transferType === 'purchase_estm'
    ) {
      return parseAccountAssetBalance(
        get(account, 'hbd_balance') ?? get(account, 'hbdBalance'),
        fundType,
      );
    }
  }

  return undefined;
};
