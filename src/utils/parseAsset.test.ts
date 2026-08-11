import parseAsset from './parseAsset';

describe('parseAsset', () => {
  it('parses the symbol, which used to come back undefined off the global Symbol', () => {
    expect(parseAsset('1.000 HIVE')).toEqual({ amount: 1, symbol: 'HIVE' });
    expect(parseAsset('2.500 HBD')).toEqual({ amount: 2.5, symbol: 'HBD' });
    expect(parseAsset('1234.567890 VESTS')).toEqual({ amount: 1234.56789, symbol: 'VESTS' });
  });

  it('returns an empty symbol for a ticker outside the Hive assets, such as Hive Engine', () => {
    expect(parseAsset('10.000 LEO')).toEqual({ amount: 10, symbol: '' });
  });

  it('tolerates a missing value instead of throwing, which the SDK version does not', () => {
    // postParser calls this on max_accepted_payout and the payout fields, which the search
    // API omits. The SDK version reads `sval.amount` on anything non-string and throws.
    expect(parseAsset(undefined as any)).toEqual({ amount: 0, symbol: '' });
    expect(parseAsset(null as any)).toEqual({ amount: 0, symbol: '' });
    expect(parseAsset(42 as any)).toEqual({ amount: 0, symbol: '' });
  });

  it('keeps the existing amount behaviour for unparseable input', () => {
    expect(parseAsset('').amount).toBeNaN();
    expect(parseAsset('abc HIVE').amount).toBeNaN();
  });
});
