/**
 * Chain rejections do not arrive in one shape.
 *
 * Broadcasts go through the SDK, which throws an `RPCError` carrying the node's
 * text in `message` and nothing else. Older code read dsteem's `jse_shortmsg`,
 * a field the SDK never sets, so predicates written against it silently stopped
 * matching and the out-of-RC offer stopped appearing. HiveSigner adds
 * `error_description`, and some transports nest the text a level or two down.
 *
 * Read every shape in one place so a transport change breaks one function
 * instead of seven call sites.
 */

const pushText = (out: string[], value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    out.push(value);
  }
};

/**
 * Every message the error carries, not just the first one found.
 *
 * A transport can wrap the chain's answer: axios sets `message` to
 * "Request failed with status code 500" while the rejection that actually
 * matters sits in `response.jse_shortmsg`. Returning only the first populated
 * field would let the wrapper hide the rejection, which is the same class of
 * miss this module exists to prevent.
 */
export const collectChainErrorMessages = (error: unknown): string[] => {
  if (!error) {
    return [];
  }

  if (typeof error === 'string') {
    return error.trim() ? [error] : [];
  }

  const err = error as any;
  const out: string[] = [];

  pushText(out, err.message);
  pushText(out, err.jse_shortmsg);
  pushText(out, err.error_description);
  pushText(out, err.error?.message);
  pushText(out, err.data?.message);
  pushText(out, err.response?.jse_shortmsg);
  pushText(out, err.response?.data?.message);
  pushText(out, err.response?.data?.error_description);
  pushText(out, err.cause?.message);

  // Every frame, not just the first: hived reports the failing assert somewhere
  // in the stack, and which frame that is depends on the operation.
  [err.data?.stack, err.error?.data?.stack, err.response?.data?.stack].forEach((stack) => {
    if (Array.isArray(stack)) {
      stack.forEach((frame: any) => {
        pushText(out, frame?.format);
        pushText(out, frame?.message);
      });
    }
  });

  if (out.length) {
    return out;
  }

  // Unrecognised shape: keep the error readable rather than losing it. Note
  // JSON.stringify answers undefined, without throwing, for a function or a
  // symbol, so the result still has to be checked.
  try {
    const serialized = JSON.stringify(error);
    return typeof serialized === 'string' ? [serialized] : [String(error)];
  } catch {
    return [String(error)];
  }
};

/** The single best message to show a user. */
export const extractChainErrorMessage = (error: unknown): string =>
  collectChainErrorMessages(error)[0] ?? '';

/**
 * Hive rejects an operation the account cannot pay for with a message naming
 * both numbers, e.g.
 *
 *   Account: spacecop has 21319011516 RC, needs 23346441566 RC.
 *   Please wait to transact, or power up HIVE.
 *
 * Match either half. Nested RPC frames carry the unformatted template, where
 * the numbers are still `${placeholders}` but the advice sentence is intact,
 * while a node that trimmed the advice still names both amounts. The numeric
 * half requires the full "has N RC, needs M RC" phrasing rather than a bare
 * "needs N RC", because a false positive here sends someone to spend Points on
 * a shortfall they do not have.
 */
const RC_SHORTFALL = /Please wait to transact|has \d+ RC, needs \d+ RC/i;

export const isInsufficientRcError = (error: unknown): boolean =>
  collectChainErrorMessages(error).some((message) => RC_SHORTFALL.test(message));

/** The post was already reblogged by this account, which is not a failure to report as one. */
export const isAlreadyReblogged = (error: unknown): boolean =>
  collectChainErrorMessages(error).some((message) => message.includes('has already reblogged'));
