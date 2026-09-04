import * as hiveuri from 'hive-uri';
import { getFormattedTx, isHiveUri, isWebUrl, normalizeHiveUri } from './hive-uri';
import { isAuthRequestDeeplink } from './authRequest';

const voteOp: [string, any] = [
  'vote',
  { voter: '__signer', author: 'good-karma', permlink: 'hello', weight: 10000 },
];
const transferOp: [string, any] = [
  'transfer',
  { from: '__signer', to: 'ecency', amount: '1.5 HIVE', memo: '' },
];

const keys = (has: Partial<Record<'posting' | 'active' | 'owner' | 'memo', boolean>>) =>
  new Map<string, boolean>(Object.entries({ posting: false, active: false, ...has }));

describe('hive uri', () => {
  it('normalises ecency://sign/ links to hive://, leaving everything else alone', () => {
    expect(normalizeHiveUri('ecency://sign/op/abc')).toBe('hive://sign/op/abc');
    expect(normalizeHiveUri('  ECENCY://sign/tx/abc  ')).toBe('hive://sign/tx/abc');
    expect(normalizeHiveUri('hive://sign/op/abc')).toBe('hive://sign/op/abc');
    expect(normalizeHiveUri('ecency://auth-request?callback=x')).toBe(
      'ecency://auth-request?callback=x',
    );
    expect(normalizeHiveUri('https://ecency.com/@good-karma')).toBe(
      'https://ecency.com/@good-karma',
    );
  });

  it('recognises hive:// and ecency://sign/ links only', () => {
    expect(isHiveUri('hive://sign/op/abc')).toBe(true);
    expect(isHiveUri('ecency://sign/tx/abc')).toBe(true);
    expect(isHiveUri(' hive://sign/op/abc ')).toBe(true);
    expect(isHiveUri('ecency://auth-request?callback=honeyback%3A%2F%2Fhive')).toBe(false);
    expect(isHiveUri('ecency://login?username=a&callback=b')).toBe(false);
    expect(isHiveUri('https://ecency.com')).toBe(false);
    expect(isHiveUri('hive:sign/op/abc')).toBe(false);
    expect(isHiveUri('')).toBe(false);
  });

  it('keeps signing links and auth requests apart', () => {
    const signLink = hiveuri.encodeOp(voteOp);
    expect(isHiveUri(signLink)).toBe(true);
    expect(isAuthRequestDeeplink(signLink)).toBe(false);
    expect(isAuthRequestDeeplink('ecency://sign/op/abc')).toBe(false);
    expect(isHiveUri('ecency://auth-request?callback=hive%3A%2F%2Fsign%2Fop%2Fabc')).toBe(false);
  });

  it('tells web urls from everything the OS must open', () => {
    expect(isWebUrl('https://ecency.com')).toBe(true);
    expect(isWebUrl(' HTTP://example.com ')).toBe(true);
    expect(isWebUrl('hive://sign/op/abc')).toBe(false);
    expect(isWebUrl('mailto:someone@example.com')).toBe(false);
  });

  it('decodes an encoded operation, in either scheme, to the same transaction', () => {
    const hiveLink = hiveuri.encodeOp(voteOp);
    const ecencyLink = `ecency://${hiveLink.slice('hive://'.length)}`;
    expect(hiveLink.startsWith('hive://sign/op/')).toBe(true);
    expect(hiveuri.decode(normalizeHiveUri(ecencyLink))).toEqual(hiveuri.decode(hiveLink));
    expect(hiveuri.decode(hiveLink).tx.operations).toEqual([voteOp]);
  });

  it('formats a single operation the signer can sign', async () => {
    const { tx } = hiveuri.decode(hiveuri.encodeOp(voteOp));
    const formatted = await getFormattedTx(tx, keys({ posting: true }));
    expect(formatted.opName).toBe('Vote');
    expect(formatted.tx.operations).toEqual([voteOp]);
    expect(formatted.tx.expiration).toBe('__expiration');
  });

  it('fills an empty signer field with __signer', async () => {
    const { tx } = hiveuri.decode(
      hiveuri.encodeOp(['vote', { voter: '', author: 'good-karma', permlink: 'hello', weight: 1 }]),
    );
    const formatted = await getFormattedTx(tx, keys({ posting: true }));
    expect(formatted.tx.operations[0][1].voter).toBe('__signer');
  });

  it('refuses an operation the stored keys cannot sign, naming the authority', async () => {
    const { tx } = hiveuri.decode(hiveuri.encodeOp(transferOp));
    await expect(getFormattedTx(tx, keys({ posting: true }))).rejects.toMatchObject({
      errorKey1: 'qr.invalid_key',
      authorityKeyType: 'active',
    });
  });

  it('formats amounts to three decimals and refuses other assets', async () => {
    const good = hiveuri.decode(hiveuri.encodeOp(transferOp));
    const formatted = await getFormattedTx(good.tx, keys({ active: true }));
    expect(formatted.opName).toBe('Transfer');
    expect(formatted.tx.operations[0][1].amount).toBe('1.500 HIVE');

    const bad = hiveuri.decode(
      hiveuri.encodeOp([
        'transfer',
        { from: '__signer', to: 'ecency', amount: '1.5 BTC', memo: '' },
      ]),
    );
    await expect(getFormattedTx(bad.tx, keys({ active: true }))).rejects.toMatchObject({
      errorKey1: 'qr.invalid_amount',
    });
  });

  it('refuses multiple operations and unknown ones', async () => {
    const multi = hiveuri.decode(hiveuri.encodeOps([voteOp, voteOp]));
    await expect(getFormattedTx(multi.tx, keys({ posting: true }))).rejects.toMatchObject({
      errorKey1: 'qr.multi_array_ops_alert',
    });

    const unknown = hiveuri.decode(hiveuri.encodeOp(['no_such_op', { a: 1 }]));
    await expect(getFormattedTx(unknown.tx, keys({ posting: true }))).rejects.toMatchObject({
      errorKey1: 'qr.invalid_op',
    });
  });
});
