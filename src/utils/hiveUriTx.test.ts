import { ensureSignableTx } from './hiveUriTx';

describe('ensureSignableTx', () => {
  it('adds an empty signatures array when missing (hive-uri resolved tx)', () => {
    const tx = { operations: [['account_update2', {}]] };
    expect(ensureSignableTx(tx).signatures).toEqual([]);
  });

  it('preserves an existing signatures array', () => {
    const tx = { operations: [], signatures: ['abc'] };
    expect(ensureSignableTx(tx).signatures).toEqual(['abc']);
  });

  it('replaces a non-array signatures value', () => {
    const tx: any = { operations: [], signatures: null };
    expect(ensureSignableTx(tx).signatures).toEqual([]);
  });

  it('tolerates null/undefined input', () => {
    expect(ensureSignableTx(undefined)).toBeUndefined();
    expect(ensureSignableTx(null)).toBeNull();
  });
});
