import { parseHiveSignerSignResult } from './hiveSignerCallback';

const REDIRECT = 'http://127.0.0.1:3000/auth';

describe('parseHiveSignerSignResult', () => {
  it('reads the transaction id off the callback', () => {
    const result = parseHiveSignerSignResult(
      `${REDIRECT}?id=6f7c217c2f5a09a5b84fc73a33c5178d236b7059&block=108922746&txn=3&sig=abc`,
      REDIRECT,
    );

    expect(result).toEqual({
      id: '6f7c217c2f5a09a5b84fc73a33c5178d236b7059',
      blockNum: 108922746,
      trxNum: 3,
    });
  });

  it('keeps the id when block and txn are missing', () => {
    const result = parseHiveSignerSignResult(`${REDIRECT}?id=abc123`, REDIRECT);

    expect(result).toEqual({ id: 'abc123', blockNum: undefined, trxNum: undefined });
  });

  it('treats a callback without an id as nothing happened', () => {
    // Not a success we can act on, and reporting one would resolve the broadcast with
    // no transaction id, which is the bug this parsing exists to close.
    expect(parseHiveSignerSignResult(`${REDIRECT}?sig=abc`, REDIRECT)).toBeNull();
  });

  it('still recognises the legacy success shapes, without an id', () => {
    expect(parseHiveSignerSignResult('https://hivesigner.com/sign/success', REDIRECT)).toEqual({});
    expect(parseHiveSignerSignResult('https://hivesigner.com/x?success=true', REDIRECT)).toEqual(
      {},
    );
  });

  it('says nothing about an ordinary navigation', () => {
    expect(parseHiveSignerSignResult('https://hivesigner.com/sign/op/abc', REDIRECT)).toBeNull();
    expect(parseHiveSignerSignResult('https://hivesigner.com/login', REDIRECT)).toBeNull();
    expect(parseHiveSignerSignResult(undefined, REDIRECT)).toBeNull();
    expect(parseHiveSignerSignResult('', REDIRECT)).toBeNull();
  });
});
