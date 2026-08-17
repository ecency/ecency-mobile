import { getTransactionExplorerUrl, resolveTrxId } from './transactionExplorer';

describe('resolveTrxId', () => {
  it('accepts a broadcast transaction id', () => {
    expect(resolveTrxId('aa82751091f8eaf6977f9a634e9eff6c4ee4208d')).toBe(
      'aa82751091f8eaf6977f9a634e9eff6c4ee4208d',
    );
  });

  // A virtual operation is emitted by the chain rather than broadcast, so
  // get_account_history gives it a zeroed id. author_reward, curation_reward and
  // fill_order are the common ones and they are the majority of rows on some tabs.
  it('rejects the zeroed id a virtual operation carries', () => {
    expect(resolveTrxId('0000000000000000000000000000000000000000')).toBeUndefined();
  });

  it('rejects a missing id', () => {
    expect(resolveTrxId(undefined)).toBeUndefined();
    expect(resolveTrxId(null)).toBeUndefined();
    expect(resolveTrxId('')).toBeUndefined();
  });

  // Hive Engine suffixes the operation's index within the transaction.
  it('strips the Hive Engine operation index', () => {
    expect(resolveTrxId('98c14ebb580b350d6f1538c2810be987cb0003db-0')).toBe(
      '98c14ebb580b350d6f1538c2810be987cb0003db',
    );
    expect(resolveTrxId('7f333bb6e0e3dc8173ea78a857134508db70955b-9')).toBe(
      '7f333bb6e0e3dc8173ea78a857134508db70955b',
    );
  });

  // A contract-generated Hive Engine row is `<block>-<index>` with no Hive transaction
  // behind it at all. 184 of 500 rows on the account this was written against.
  it('rejects a Hive Engine row with no Hive transaction', () => {
    expect(resolveTrxId('109092570-0')).toBeUndefined();
    expect(resolveTrxId('109087215-4')).toBeUndefined();
  });

  it('rejects anything that is not a transaction id', () => {
    expect(resolveTrxId('not-a-transaction')).toBeUndefined();
    expect(resolveTrxId('aa82751091')).toBeUndefined();
    expect(resolveTrxId(`${'a'.repeat(41)}`)).toBeUndefined();
  });

  it('normalises case and surrounding whitespace', () => {
    expect(resolveTrxId('  AA82751091F8EAF6977F9A634E9EFF6C4EE4208D  ')).toBe(
      'aa82751091f8eaf6977f9a634e9eff6c4ee4208d',
    );
  });
});

describe('getTransactionExplorerUrl', () => {
  it('builds the explorer link', () => {
    expect(getTransactionExplorerUrl('aa82751091f8eaf6977f9a634e9eff6c4ee4208d')).toBe(
      'https://hivexplorer.com/tx/aa82751091f8eaf6977f9a634e9eff6c4ee4208d',
    );
  });

  it('offers no link where there is no transaction', () => {
    expect(getTransactionExplorerUrl('0000000000000000000000000000000000000000')).toBeUndefined();
    expect(getTransactionExplorerUrl('109092570-0')).toBeUndefined();
    expect(getTransactionExplorerUrl(undefined)).toBeUndefined();
  });
});
