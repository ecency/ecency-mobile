import { PrivateKey, Signature, sha256 } from '@ecency/sdk';
import { makeHsCode, makeHsLoginProof } from './hive-signer-helper';

const decode = (token: string) =>
  JSON.parse(
    Buffer.from(
      token.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '='),
      'base64',
    ).toString(),
  );

// Checks a token the way HiveSigner and games-api do: the signed bytes are
// exactly these three fields in this order, rebuilt from the decoded token,
// and the signature over their sha256 must be by the account's key.
const verifies = (m: any, key: PrivateKey): boolean => {
  const bytes = JSON.stringify({
    signed_message: m.signed_message,
    authors: m.authors,
    timestamp: m.timestamp,
  });
  const publicKey: any = key.createPublic();
  return publicKey.verify(sha256(bytes), (Signature as any).from(m.signatures[0]));
};

describe('hive-signer-helper', () => {
  const key = PrivateKey.fromSeed('hive-signer-helper test');
  const otherKey = PrivateKey.fromSeed('another key');

  it('makeHsCode is unchanged: a code for ecency.app, what login exchanges', () => {
    const before = Date.now() / 1000;
    const m = decode(makeHsCode('good-karma', key));
    expect(m.signed_message).toEqual({ type: 'code', app: 'ecency.app' });
    expect(m.authors).toEqual(['good-karma']);
    expect(m.timestamp).toBeGreaterThanOrEqual(before - 1);
    expect(m.timestamp).toBeLessThanOrEqual(Date.now() / 1000 + 1);
    expect(m.signatures).toHaveLength(1);
    expect(verifies(m, key)).toBe(true);
    expect(verifies(m, otherKey)).toBe(false);
  });

  it('makeHsLoginProof is typed login for ecency.app and names its audience', () => {
    const m = decode(makeHsLoginProof('good-karma', key, 'honeyback://hive'));
    expect(m.signed_message).toEqual({
      type: 'login',
      app: 'ecency.app',
      audience: 'honeyback://hive',
    });
    expect(Object.keys(m.signed_message)).toEqual(['type', 'app', 'audience']);
    expect(m.authors).toEqual(['good-karma']);
    expect(typeof m.timestamp).toBe('number');
    expect(m.signatures).toHaveLength(1);
    expect(verifies(m, key)).toBe(true);
  });

  it('a proof altered for another audience no longer verifies', () => {
    const a = decode(makeHsLoginProof('good-karma', key, 'honeyback://hive'));
    const b = {
      ...a,
      signed_message: { ...a.signed_message, audience: 'https://elsewhere.example' },
    };
    expect(verifies(b, key)).toBe(false);
  });
});
