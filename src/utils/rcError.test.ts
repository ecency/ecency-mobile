import { extractChainErrorMessage, isInsufficientRcError, isAlreadyReblogged } from './rcError';

/** The text Hive actually returns, from a real rejection. */
const RC_TEXT =
  'Account: spacecop has 21319011516 RC, needs 23346441566 RC. ' +
  'Please wait to transact, or power up HIVE.';

/**
 * The shape the SDK throws today: name RPCError, text in `message`, and no
 * `jse_shortmsg` anywhere. Every predicate written against `jse_shortmsg` reads
 * undefined here, which is how the RC offer went quiet.
 */
const rpcError = () => {
  const err: any = new Error(RC_TEXT);
  err.name = 'RPCError';
  err.code = -32003;
  return err;
};

describe('isInsufficientRcError', () => {
  it('matches the SDK RPCError, which carries the text only in message', () => {
    expect(isInsufficientRcError(rpcError())).toBe(true);
  });

  it('still matches dsteem-era jse_shortmsg, top level and under response', () => {
    expect(isInsufficientRcError({ jse_shortmsg: RC_TEXT })).toBe(true);
    expect(isInsufficientRcError({ response: { jse_shortmsg: RC_TEXT } })).toBe(true);
  });

  it('matches HiveSigner error_description', () => {
    expect(isInsufficientRcError({ error_description: RC_TEXT })).toBe(true);
  });

  it('matches the text nested in RPC error data', () => {
    expect(isInsufficientRcError({ data: { stack: [{ format: RC_TEXT }] } })).toBe(true);
  });

  it('matches a node that returns only the needs-N-RC half', () => {
    expect(isInsufficientRcError(new Error('Account: alice has 1 RC, needs 5000 RC.'))).toBe(true);
  });

  it('does not fire on other chain rejections', () => {
    expect(isInsufficientRcError(new Error('Missing Posting Authority'))).toBe(false);
    expect(isInsufficientRcError(new Error('has already reblogged this post'))).toBe(false);
    expect(isInsufficientRcError(new Error('Comment already has a payout'))).toBe(false);
  });

  it('does not fire on nothing', () => {
    expect(isInsufficientRcError(undefined)).toBe(false);
    expect(isInsufficientRcError(null)).toBe(false);
    expect(isInsufficientRcError({})).toBe(false);
    expect(isInsufficientRcError('')).toBe(false);
  });
});

describe('isAlreadyReblogged', () => {
  it('matches whichever field carries the text', () => {
    const text = 'Account nathan has already reblogged this post';
    expect(isAlreadyReblogged(new Error(text))).toBe(true);
    expect(isAlreadyReblogged({ jse_shortmsg: text })).toBe(true);
  });

  it('does not fire on an out-of-RC rejection', () => {
    expect(isAlreadyReblogged(rpcError())).toBe(false);
  });
});

describe('extractChainErrorMessage', () => {
  it('reads a plain string through unchanged', () => {
    expect(extractChainErrorMessage('boom')).toBe('boom');
  });

  it('prefers a populated field over an empty one', () => {
    expect(extractChainErrorMessage({ message: '', jse_shortmsg: RC_TEXT })).toBe(RC_TEXT);
  });

  it('falls back to a serialization rather than losing the error', () => {
    expect(extractChainErrorMessage({ unexpected: 'shape' })).toBe('{"unexpected":"shape"}');
  });

  it('survives an object that cannot be serialized', () => {
    const circular: any = {};
    circular.self = circular;
    expect(() => extractChainErrorMessage(circular)).not.toThrow();
  });
});
