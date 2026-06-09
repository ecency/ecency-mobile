import {
  normalizeTransferType,
  parseAccountAssetBalance,
  getNativeAccountBalance,
} from './transferBalance';
import TransferTypes from '../constants/transferTypes';

describe('normalizeTransferType', () => {
  it('maps the transfer_token alias to TRANSFER', () => {
    expect(normalizeTransferType('transfer_token')).toBe(TransferTypes.TRANSFER);
  });

  it('maps savings-withdrawal aliases to TRANSFER_FROM_SAVINGS', () => {
    expect(normalizeTransferType('withdraw_hive')).toBe(TransferTypes.TRANSFER_FROM_SAVINGS);
    expect(normalizeTransferType('withdraw_hbd')).toBe(TransferTypes.TRANSFER_FROM_SAVINGS);
  });

  it('passes through canonical and unknown types unchanged', () => {
    expect(normalizeTransferType(TransferTypes.RECURRENT_TRANSFER)).toBe(
      TransferTypes.RECURRENT_TRANSFER,
    );
    expect(normalizeTransferType('purchase_estm')).toBe('purchase_estm');
    expect(normalizeTransferType('')).toBe('');
  });
});

describe('parseAccountAssetBalance', () => {
  it('strips the asset suffix and parses to a number', () => {
    expect(parseAccountAssetBalance('10.000 HIVE', 'HIVE')).toBe(10);
    expect(parseAccountAssetBalance('5.500 HBD', 'HBD')).toBe(5.5);
  });

  it('honors a real zero balance', () => {
    expect(parseAccountAssetBalance('0.000 HIVE', 'HIVE')).toBe(0);
  });

  it('returns a finite number as-is', () => {
    expect(parseAccountAssetBalance(12.3, 'HIVE')).toBe(12.3);
  });

  it('returns undefined for empty, nullish, NaN, or unparsable values', () => {
    expect(parseAccountAssetBalance('', 'HIVE')).toBeUndefined();
    expect(parseAccountAssetBalance(null, 'HIVE')).toBeUndefined();
    expect(parseAccountAssetBalance(undefined, 'HIVE')).toBeUndefined();
    expect(parseAccountAssetBalance(NaN, 'HIVE')).toBeUndefined();
    expect(parseAccountAssetBalance('abc HIVE', 'HIVE')).toBeUndefined();
  });
});

describe('getNativeAccountBalance', () => {
  const account = {
    balance: '10.000 HIVE',
    hbd_balance: '4.000 HBD',
    savings_balance: '2.000 HIVE',
    savings_hbd_balance: '1.000 HBD',
  };

  it('returns undefined when the account is missing', () => {
    expect(getNativeAccountBalance(null, TransferTypes.TRANSFER, 'HIVE')).toBeUndefined();
    expect(getNativeAccountBalance(undefined, TransferTypes.TRANSFER, 'HBD')).toBeUndefined();
  });

  it('selects the liquid HIVE balance for transfer, recurrent, to-savings and to-vesting', () => {
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER, 'HIVE')).toBe(10);
    expect(getNativeAccountBalance(account, TransferTypes.RECURRENT_TRANSFER, 'HIVE')).toBe(10);
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER_TO_SAVINGS, 'HIVE')).toBe(10);
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER_TO_VESTING, 'HIVE')).toBe(10);
  });

  it('selects the liquid HBD balance for transfer, recurrent and convert', () => {
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER, 'HBD')).toBe(4);
    expect(getNativeAccountBalance(account, TransferTypes.RECURRENT_TRANSFER, 'HBD')).toBe(4);
    expect(getNativeAccountBalance(account, TransferTypes.CONVERT, 'HBD')).toBe(4);
  });

  it('selects savings balances for withdrawals, including the legacy aliases', () => {
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER_FROM_SAVINGS, 'HIVE')).toBe(2);
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER_FROM_SAVINGS, 'HBD')).toBe(1);
    expect(getNativeAccountBalance(account, 'withdraw_hive', 'HIVE')).toBe(2);
    expect(getNativeAccountBalance(account, 'withdraw_hbd', 'HBD')).toBe(1);
  });

  it('falls back to the camelCase savings fields', () => {
    const camel = { savingBalance: '7.000 HIVE', savingBalanceHbd: '3.000 HBD' };
    expect(getNativeAccountBalance(camel, TransferTypes.TRANSFER_FROM_SAVINGS, 'HIVE')).toBe(7);
    expect(getNativeAccountBalance(camel, TransferTypes.TRANSFER_FROM_SAVINGS, 'HBD')).toBe(3);
  });

  it('returns undefined for unsupported type/asset combinations', () => {
    expect(
      getNativeAccountBalance(account, TransferTypes.DELEGATE_VESTING_SHARES, 'HIVE'),
    ).toBeUndefined();
    // CONVERT is HBD-only; there is no HIVE convert balance.
    expect(getNativeAccountBalance(account, TransferTypes.CONVERT, 'HIVE')).toBeUndefined();
    expect(getNativeAccountBalance(account, TransferTypes.TRANSFER, 'POINT')).toBeUndefined();
  });
});
