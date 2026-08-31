// A deadline for every HTTP(S) `fetch` the app makes.
//
// React Native's Android networking stack builds its shared OkHttpClient with
// connect/read/write timeouts of 0, which OkHttp reads as "no timeout"
// (OkHttpClientProvider.createClientBuilder), and the whatwg-fetch polyfill
// never sets `xhr.timeout`. A request that is accepted and then never answered
// therefore stays open for the life of the process: the promise never settles,
// React Query never leaves `pending`, and the screen keeps its skeleton with no
// error and no retry.
//
// OkHttp also dispatches at most 5 concurrent calls PER HOST. Five calls with no
// deadline park every later call to that host in the ready queue indefinitely.
// Bounding each call bounds that queue too: aborting the JS request cancels the
// underlying OkHttp call, which releases the per-host slot. Note this only covers
// `fetch`; an axios client on the same host shares the same five slots and needs
// its own `timeout` (see config/ecencyApi).
//
// Installed on the global `fetch` rather than at each call site because the call
// sites are mostly inside `@ecency/sdk`, which binds `globalThis.fetch` on first
// use and caches the bound reference.
//
// Two deliberate carve-outs:
//   * Only http/https get a deadline. `fetch('file://...')` is how a picked video
//     is read into a Blob before a resumable upload (providers/speak). That read
//     is disk-bound, has no network component, and legitimately runs for minutes
//     on a large file.
//   * The deadline covers the whole call including the request body, so a short
//     one would cut a slow upload mid-send. A binary or multipart body gets the
//     same generous ceiling the image upload path already uses.

/**
 * Deadline for our own endpoints, whose latency we actually know: they answer
 * well under a second in normal operation.
 *
 * Not sized on server latency alone. The budget also has to absorb time spent
 * queued behind the five-slot-per-host dispatcher during a cold start, and, on a
 * host that resolves to several addresses, one dead route failing over to the
 * next (bounded by the connect timeout set in MainApplication.kt). 20s is roughly
 * twenty times the normal response time, so it can only fire on a path that is
 * genuinely not working, which is the point: the users this protects are on bad
 * links, and cutting them off early would break the very requests that would
 * have succeeded late.
 */
export const FIRST_PARTY_TIMEOUT_MS = 20000;

/**
 * Deadline for every other host. Deliberately looser: third-party APIs and Hive
 * RPC nodes carry their own, tighter budgets (hive-tx is configured at 10s in
 * providers/queries/sdk-config), so this is only a backstop for a caller that set
 * none, and a backstop that fires too early is worse than one that fires late.
 */
export const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Ceiling for a request that carries a body we did not build from a string, i.e.
 * an upload. Matches the existing image upload ceiling in config/imageApi.
 */
export const UPLOAD_TIMEOUT_MS = 120000;

/** Sentinel: this request gets no deadline at all. */
export const NO_TIMEOUT = 0;

const FIRST_PARTY_HOST = 'ecency.com';

const URL_RE = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)/i;

/**
 * Scheme and host of an absolute URL, both lowercased, host without userinfo or
 * port. Both are '' for a relative URL. Hand-rolled rather than `new URL()` so
 * this module does not depend on the URL polyfill having been installed first.
 */
export const parseUrl = (url: string): { scheme: string; host: string } => {
  const match = URL_RE.exec(url);
  if (!match) {
    return { scheme: '', host: '' };
  }

  const scheme = match[1].toLowerCase();
  const authority = match[2];
  const at = authority.lastIndexOf('@');
  const hostPort = at >= 0 ? authority.slice(at + 1) : authority;

  // IPv6 literals keep their brackets and may not be split on ':'.
  if (hostPort.startsWith('[')) {
    const end = hostPort.indexOf(']');
    return { scheme, host: (end >= 0 ? hostPort.slice(0, end + 1) : hostPort).toLowerCase() };
  }

  const colon = hostPort.indexOf(':');
  return { scheme, host: (colon >= 0 ? hostPort.slice(0, colon) : hostPort).toLowerCase() };
};

export const hostOf = (url: string): string => parseUrl(url).host;

/**
 * True for a body this module did not get as a string, which in practice means an
 * upload: FormData, Blob, ArrayBuffer or a typed-array view.
 */
export const isUploadBody = (body: unknown): boolean => {
  if (!body || typeof body === 'string') {
    return false;
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return true;
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return true;
  }
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }
  return ArrayBuffer.isView(body) || body instanceof ArrayBuffer;
};

/**
 * True when a fetch input carries an upload body. `fetch(request)` keeps the body
 * on the Request rather than in `init`, and the polyfill this app uses stores the
 * original value on a private field instead of exposing a stream, so both are
 * checked. Without this an upload passed that way gets the short deadline.
 */
export const hasUploadInput = (input?: unknown): boolean => {
  if (!input || typeof input !== 'object') {
    return false;
  }
  const req = input as Record<string, unknown>;
  return (
    isUploadBody(req.body) ||
    isUploadBody(req._bodyFormData) ||
    isUploadBody(req._bodyBlob) ||
    isUploadBody(req._bodyArrayBuffer)
  );
};

export const resolveTimeoutMs = (url: string, init?: RequestInit, input?: unknown): number => {
  const { scheme } = parseUrl(url);

  // Only network requests get a deadline. `file:`, `content:`, `asset:`, `data:`
  // and `blob:` reads are disk- or memory-bound and can legitimately run long.
  if (scheme !== 'http' && scheme !== 'https') {
    return NO_TIMEOUT;
  }

  if (isUploadBody(init?.body) || hasUploadInput(input)) {
    return UPLOAD_TIMEOUT_MS;
  }

  const host = hostOf(url);
  const isFirstParty = host === FIRST_PARTY_HOST || host.endsWith(`.${FIRST_PARTY_HOST}`);
  return isFirstParty ? FIRST_PARTY_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
};

/**
 * The error a caller sees when the deadline, rather than the caller, ended the
 * request. `name` is the contract: the retry policy in providers/queries reads it,
 * the error view picks its message from it, and it keeps a timeout from grouping
 * with a user-driven cancellation.
 *
 * The host, never the URL, so a local file path or a query string cannot reach a
 * log or a crash report through the message.
 */
export const createTimeoutError = (url: string, timeoutMs: number): Error => {
  const error = new Error(`Request timed out after ${timeoutMs}ms: ${hostOf(url) || 'request'}`);
  error.name = 'TimeoutError';
  return error;
};

const signalOf = (input: unknown, init?: RequestInit): AbortSignal | undefined => {
  // An explicit `signal: null` in init clears the Request's signal per spec, so
  // `'signal' in init` is checked before falling back to the Request's own.
  if (init && 'signal' in init) {
    return init.signal ?? undefined;
  }
  if (input && typeof input === 'object' && 'signal' in input) {
    return (input as { signal?: AbortSignal }).signal ?? undefined;
  }
  return undefined;
};

const urlOf = (input: unknown): string => {
  if (typeof input === 'string') {
    return input;
  }
  if (input && typeof input === 'object') {
    // A Request carries the address on `url`. A URL object carries it on `href`
    // and is a valid fetch input in its own right -- fetch stringifies it. Miss
    // that and the request resolves to no scheme, which reads as NO_TIMEOUT and
    // leaves exactly the unbounded request this module exists to prevent.
    const candidate = input as { url?: unknown; href?: unknown };
    if (typeof candidate.url === 'string' && candidate.url) {
      return candidate.url;
    }
    if (typeof candidate.href === 'string') {
      return candidate.href;
    }
  }
  return '';
};

/**
 * Combine the caller's signal with ours, with cleanup.
 *
 * Hand-rolled rather than `AbortSignal.any` because on this platform
 * `AbortSignal` comes from the `abort-controller` package, whose `abort()` takes
 * no argument and never populates `signal.reason`. Anything that reads `reason`
 * to tell a timeout from a cancellation works under Jest on Node and is dead code
 * on device. The wrapper below discriminates on a flag it owns instead.
 */
const combineSignals = (
  caller: AbortSignal | undefined,
  ours: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } => {
  if (!caller) {
    return { signal: ours, cleanup: () => {} };
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  caller.addEventListener('abort', onAbort);
  ours.addEventListener('abort', onAbort);

  return {
    signal: controller.signal,
    cleanup: () => {
      caller.removeEventListener('abort', onAbort);
      ours.removeEventListener('abort', onAbort);
    },
  };
};

/**
 * Wrap a fetch implementation so every HTTP(S) request carries a deadline,
 * combined with whatever signal the caller already passed.
 *
 * `resolveTimeout` is a parameter so the deadline policy stays separable from the
 * mechanism and a test can exercise expiry without waiting out a real window.
 */
export const withDeadline = (
  baseFetch: typeof fetch,
  resolveTimeout: (url: string, init?: RequestInit, input?: unknown) => number = resolveTimeoutMs,
): typeof fetch => {
  const deadlineFetch = (input: any, init?: RequestInit) => {
    const url = urlOf(input);
    const timeoutMs = resolveTimeout(url, init, input);

    if (!timeoutMs || timeoutMs <= 0) {
      return baseFetch(input, init);
    }

    const callerSignal = signalOf(input, init);

    // Already cancelled: hand it straight through so the rejection is the
    // caller's own AbortError and not a timeout we invented.
    if (callerSignal?.aborted) {
      return baseFetch(input, init);
    }

    const controller = new AbortController();
    let expired = false;
    const timer = setTimeout(() => {
      expired = true;
      controller.abort();
    }, timeoutMs);

    const { signal, cleanup } = combineSignals(callerSignal, controller.signal);

    const settle = () => {
      clearTimeout(timer);
      cleanup();
    };

    return baseFetch(input, { ...(init ?? {}), signal }).then(
      (response) => {
        settle();
        return response;
      },
      (error) => {
        settle();
        // whatwg-fetch rejects every abort with a flat AbortError and this
        // platform never carries `signal.reason`, so `expired` is the only
        // reliable way to tell our deadline from the caller's cancellation.
        if (expired && !callerSignal?.aborted) {
          throw createTimeoutError(url, timeoutMs);
        }
        throw error;
      },
    );
  };

  return deadlineFetch as typeof fetch;
};
