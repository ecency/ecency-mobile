import {
  collectChainErrorMessages,
  extractChainErrorMessage,
  isInsufficientRcError,
  isAlreadyReblogged,
} from './rcError';

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

  it('matches a node that returns only the numeric half, without the advice', () => {
    expect(isInsufficientRcError(new Error('Account: alice has 1 RC, needs 5000 RC.'))).toBe(true);
  });

  // Regression: a transport that wraps the chain's answer must not hide it.
  // axios sets `message` to its own status text while the rejection that
  // matters sits under `response`.
  it('looks past a generic wrapper message to the nested rejection', () => {
    const wrapped: any = new Error('Request failed with status code 500');
    wrapped.response = { jse_shortmsg: RC_TEXT };
    expect(isInsufficientRcError(wrapped)).toBe(true);
  });

  it('looks past a wrapper to error_description and to nested response data', () => {
    expect(isInsufficientRcError({ message: 'Request failed', error_description: RC_TEXT })).toBe(
      true,
    );
    expect(
      isInsufficientRcError({
        message: 'Request failed',
        response: { data: { message: RC_TEXT } },
      }),
    ).toBe(true);
  });

  // Which frame carries the failing assert depends on the operation, so the
  // whole stack is searched rather than index zero.
  it('finds the rejection in any stack frame, not only the first', () => {
    expect(
      isInsufficientRcError({
        message: 'Assert Exception',
        data: {
          stack: [{ format: 'unrelated frame' }, { format: RC_TEXT }],
        },
      }),
    ).toBe(true);
  });

  // hived reports the unformatted template, where the amounts are still
  // placeholders. The advice sentence is what identifies it.
  it('matches the unformatted template hived puts in a stack frame', () => {
    /* eslint-disable no-template-curly-in-string -- hived's own format string, verbatim */
    const template =
      'Account: ${account} has ${account_rc} RC, needs ${op_rc} RC. ' +
      'Please wait to transact, or power up HIVE.';
    /* eslint-enable no-template-curly-in-string */
    expect(isInsufficientRcError({ data: { stack: [{ format: template }] } })).toBe(true);
  });

  // A bare "needs N RC" is not enough: a false positive here sends someone to
  // spend Points on a shortfall they do not have.
  it('does not fire on a bare needs-N-RC phrase without the account context', () => {
    expect(isInsufficientRcError(new Error('This feature needs 100 RC tokens to enable'))).toBe(
      false,
    );
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

  it('looks past a generic wrapper message', () => {
    expect(
      isAlreadyReblogged({
        message: 'Request failed with status code 500',
        response: { jse_shortmsg: 'Account nathan has already reblogged this post' },
      }),
    ).toBe(true);
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
    expect(typeof extractChainErrorMessage(circular)).toBe('string');
  });

  // JSON.stringify answers undefined for these, without throwing, so the catch
  // block alone would let a non-string escape the declared return type and the
  // predicates would then call .includes on it inside an error handler.
  it('still returns a string for inputs JSON.stringify cannot represent', () => {
    expect(typeof extractChainErrorMessage(() => undefined)).toBe('string');
    expect(typeof extractChainErrorMessage(Symbol('nope'))).toBe('string');
    expect(() => isInsufficientRcError(() => undefined)).not.toThrow();
    expect(() => isAlreadyReblogged(Symbol('nope'))).not.toThrow();
  });
});

describe('collectChainErrorMessages', () => {
  it('returns every populated field, wrapper first', () => {
    const wrapped: any = new Error('Request failed');
    wrapped.response = { jse_shortmsg: RC_TEXT };
    expect(collectChainErrorMessages(wrapped)).toEqual(['Request failed', RC_TEXT]);
  });

  it('skips blank and whitespace-only fields', () => {
    expect(collectChainErrorMessages({ message: '   ', jse_shortmsg: RC_TEXT })).toEqual([RC_TEXT]);
  });

  it('returns nothing for nothing', () => {
    expect(collectChainErrorMessages(undefined)).toEqual([]);
    expect(collectChainErrorMessages('')).toEqual([]);
  });
});
