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
export const extractChainErrorMessage = (error: unknown): string => {
  if (!error) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  const err = error as any;
  const candidates = [
    err.message,
    err.jse_shortmsg,
    err.error_description,
    err.error?.message,
    err.data?.message,
    err.data?.stack?.[0]?.format,
    err.response?.jse_shortmsg,
    err.response?.data?.message,
    err.response?.data?.error_description,
    err.cause?.message,
  ];

  const found = candidates.find((candidate) => typeof candidate === 'string' && candidate);
  if (found) {
    return String(found);
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

/**
 * Hive rejects an operation the account cannot pay for with a message naming
 * both numbers, e.g.
 *
 *   Account: spacecop has 21319011516 RC, needs 23346441566 RC.
 *   Please wait to transact, or power up HIVE.
 *
 * Match either half: nodes have shortened this text before, and matching only
 * the advice sentence is what makes the check brittle.
 */
export const isInsufficientRcError = (error: unknown): boolean =>
  /Please wait to transact|needs \d+ RC/i.test(extractChainErrorMessage(error));

/** The post was already reblogged by this account, which is not a failure to report as one. */
export const isAlreadyReblogged = (error: unknown): boolean =>
  extractChainErrorMessage(error).includes('has already reblogged');
