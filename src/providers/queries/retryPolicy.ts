// Retry policy for the app-wide QueryClient.
//
// Kept in its own module so the policy can be read and tested without pulling in
// the whole query barrel (AsyncStorage, the SDK, every query hook).

/**
 * Statuses worth a second attempt. Anything else the server actually answered
 * with (401, 403, 404, 422, ...) will answer the same way on a retry, so retrying
 * only delays the error the screen needs to show.
 */
export const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const statusOf = (error: unknown): number | undefined => {
  const candidate = error as { status?: number; response?: { status?: number } };
  return candidate?.status ?? candidate?.response?.status;
};

/**
 * One retry, and only where a retry can plausibly help.
 *
 * The point of the policy is that every query reaches a settled state within a
 * predictable window. React Query's default is three retries with exponential
 * backoff, which on top of a request deadline means a screen could sit on a
 * skeleton for minutes before it is allowed to show an error, and it multiplies
 * load on exactly the host that is already failing.
 *
 * The one retry is still worth having: a single wedged connection often clears on
 * a fresh one, and aborting the first attempt releases the per-host slot it was
 * holding.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  // React Query cancelled this query itself (unmount, key change, refetch).
  // Retrying resurrects work the app deliberately dropped.
  if ((error as { name?: string })?.name === 'AbortError') {
    return false;
  }

  const status = statusOf(error);
  if (typeof status === 'number' && !RETRYABLE_STATUS.has(status)) {
    return false;
  }

  return failureCount < 1;
};

/**
 * The policy above retries once, so only the first delay is ever used. The cap is
 * kept so a per-query `retry` override cannot inherit an unbounded exponential
 * backoff.
 */
export const retryDelay = (attemptIndex: number): number =>
  Math.min(1000 * 2 ** attemptIndex, 8000);
