import {
  DEFAULT_TIMEOUT_MS,
  FIRST_PARTY_TIMEOUT_MS,
  NO_TIMEOUT,
  UPLOAD_TIMEOUT_MS,
  hostOf,
  resolveTimeoutMs,
  withDeadline,
} from './networkTimeout';

const okResponse = {} as Response;

/** Stands in for whatwg-fetch: settles only when the signal it was given aborts. */
const makeStallingFetch = () =>
  jest.fn(
    (_input: any, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      }),
  );

/**
 * A signal that reports how many listeners are attached, so the wrapper's cleanup
 * can be asserted directly rather than inferred.
 */
const makeCountingSignal = () => {
  const listeners = new Set<() => void>();
  return {
    aborted: false,
    addEventListener: (_type: string, fn: () => void) => {
      listeners.add(fn);
    },
    removeEventListener: (_type: string, fn: () => void) => {
      listeners.delete(fn);
    },
    listenerCount: () => listeners.size,
  };
};

describe('resolveTimeoutMs', () => {
  it.each([
    ['a picked video read off disk', 'file:///storage/emulated/0/DCIM/video.mp4'],
    ['an Android content URI', 'content://media/external/video/media/42'],
    ['an inline data URI', 'data:image/png;base64,AAA'],
    ['a blob URL', 'blob:abcd-1234'],
    ['a relative path', '/private-api/whatever'],
  ])('gives no deadline to %s', (_label, url) => {
    expect(resolveTimeoutMs(url)).toBe(NO_TIMEOUT);
  });

  it.each([
    ['https://ecency.com/private-api/x'],
    ['https://images.ecency.com/p/abc'],
    ['http://ecency.com/dmca/dmca-posts.json'],
    ['https://ECENCY.com:443/private-api/x'],
  ])('gives our own endpoints the first-party budget: %s', (url) => {
    expect(resolveTimeoutMs(url)).toBe(FIRST_PARTY_TIMEOUT_MS);
  });

  it.each([
    // The suffix check must be on '.ecency.com', not on 'ecency.com', or any
    // domain merely ending in those characters is treated as ours.
    ['https://notecency.com/x'],
    ['https://api.coingecko.com/api/v3/simple/price'],
    // Userinfo must not be mistaken for the host.
    ['https://ecency.com@evil.example/x'],
  ])('gives every other host the backstop budget: %s', (url) => {
    expect(resolveTimeoutMs(url)).toBe(DEFAULT_TIMEOUT_MS);
  });

  it('gives an upload body the upload ceiling rather than a request budget', () => {
    const body = new FormData();
    expect(resolveTimeoutMs('https://ecency.com/private-api/x', { body })).toBe(UPLOAD_TIMEOUT_MS);
  });

  it('does not treat a plain string body as an upload', () => {
    expect(resolveTimeoutMs('https://ecency.com/private-api/x', { body: '{"a":1}' })).toBe(
      FIRST_PARTY_TIMEOUT_MS,
    );
  });

  it('gives the upload ceiling to a body carried on the request rather than in init', () => {
    // `fetch(request)` keeps the body on the Request, so a check that only reads
    // `init.body` would hand a slow upload the short budget and cut it off.
    const request = { url: 'https://ecency.com/private-api/x', body: new FormData() };
    expect(resolveTimeoutMs('https://ecency.com/private-api/x', undefined, request)).toBe(
      UPLOAD_TIMEOUT_MS,
    );
  });

  it('gives the upload ceiling to a polyfill request that keeps its body privately', () => {
    const request = { url: 'https://ecency.com/private-api/x', _bodyFormData: new FormData() };
    expect(resolveTimeoutMs('https://ecency.com/private-api/x', undefined, request)).toBe(
      UPLOAD_TIMEOUT_MS,
    );
  });
});

describe('withDeadline with a URL object input', () => {
  it('bounds a stalling request made with a URL object rather than a string', async () => {
    // A URL object is a valid fetch input and carries its address on `href`, not
    // `url`. Reading only `url` yields no scheme, which resolves to NO_TIMEOUT and
    // leaves the request pending forever -- the exact failure this module removes.
    jest.useFakeTimers();
    try {
      const stalling = makeStallingFetch();
      const wrapped = withDeadline(stalling as unknown as typeof fetch);
      const pending = wrapped(new URL('https://ecency.com/private-api/x') as any);
      const assertion = expect(pending).rejects.toMatchObject({ name: 'TimeoutError' });
      jest.advanceTimersByTime(FIRST_PARTY_TIMEOUT_MS);
      await assertion;
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('hostOf', () => {
  it('strips port, userinfo and case', () => {
    expect(hostOf('https://user:pw@Images.Ecency.com:8443/p/abc')).toBe('images.ecency.com');
  });

  it('keeps an IPv6 literal intact', () => {
    expect(hostOf('http://[2001:db8::1]:8080/x')).toBe('[2001:db8::1]');
  });
});

describe('withDeadline', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects with a TimeoutError when the deadline expires', async () => {
    const baseFetch = makeStallingFetch();
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);

    const promise = wrapped('https://ecency.com/private-api/thing?code=secret');
    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('names only the host in the timeout message, never the path or query', async () => {
    const baseFetch = makeStallingFetch();
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);

    const promise = wrapped('https://ecency.com/private-api/thing?code=secret');
    jest.advanceTimersByTime(1000);

    const error = await promise.then(
      () => null,
      (e) => e as Error,
    );
    expect(error?.message).toContain('ecency.com');
    expect(error?.message).not.toContain('private-api');
    expect(error?.message).not.toContain('secret');
  });

  it("surfaces the caller's own abort rather than relabelling it a timeout", async () => {
    const baseFetch = makeStallingFetch();
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 60000);
    const controller = new AbortController();

    const promise = wrapped('https://ecency.com/x', { signal: controller.signal });
    controller.abort();

    const error = await promise.then(
      () => null,
      (e) => e as Error,
    );
    expect(error?.name).toBe('AbortError');
    expect(error?.name).not.toBe('TimeoutError');
  });

  it("keeps the caller's abort when the deadline expires in the same tick", async () => {
    // whatwg-fetch defers its abort rejection by a tick, so our own deadline can
    // fire in the window between the caller cancelling and the rejection landing.
    // Without the `callerSignal.aborted` check the wrapper would relabel a
    // deliberate cancellation as a timeout, and the retry policy would retry work
    // the app had just dropped.
    const baseFetch = jest.fn(
      (_input: any, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            setTimeout(() => {
              const error = new Error('Aborted');
              error.name = 'AbortError';
              reject(error);
            }, 0);
          });
        }),
    );
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);
    const controller = new AbortController();

    const promise = wrapped('https://ecency.com/x', { signal: controller.signal });
    controller.abort();
    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('still reports a timeout when the caller passed a signal it never aborted', async () => {
    const baseFetch = makeStallingFetch();
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);
    const controller = new AbortController();

    const promise = wrapped('https://ecency.com/x', { signal: controller.signal });
    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('forwards an already-aborted request untouched, with no deadline of its own', async () => {
    const baseFetch = jest.fn((_input: any, _init?: RequestInit) => Promise.resolve(okResponse));
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);
    const controller = new AbortController();
    controller.abort();
    const init: RequestInit = { signal: controller.signal };

    await wrapped('https://ecency.com/x', init);

    expect(baseFetch.mock.calls[0][1]).toBe(init);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('forwards a request that gets no deadline untouched', async () => {
    const baseFetch = jest.fn((_input: any, _init?: RequestInit) => Promise.resolve(okResponse));
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => NO_TIMEOUT);
    const init: RequestInit = { method: 'GET' };

    await wrapped('file:///storage/emulated/0/DCIM/video.mp4', init);

    expect(baseFetch.mock.calls[0][1]).toBe(init);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('clears the deadline timer once the request succeeds', async () => {
    const baseFetch = jest.fn(async () => okResponse);
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);

    const promise = wrapped('https://ecency.com/x');
    expect(jest.getTimerCount()).toBe(1);

    await expect(promise).resolves.toBe(okResponse);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('clears the deadline timer once the request fails', async () => {
    const baseFetch = jest.fn(async () => {
      throw new Error('Network request failed');
    });
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);

    await expect(wrapped('https://ecency.com/x')).rejects.toThrow('Network request failed');
    expect(jest.getTimerCount()).toBe(0);
  });

  it("detaches its listener from the caller's signal once the request settles", async () => {
    const baseFetch = jest.fn(async () => okResponse);
    const wrapped = withDeadline(baseFetch as unknown as typeof fetch, () => 1000);
    const signal = makeCountingSignal();

    const promise = wrapped('https://ecency.com/x', {
      signal: signal as unknown as AbortSignal,
    });
    expect(signal.listenerCount()).toBe(1);

    await promise;
    expect(signal.listenerCount()).toBe(0);
  });
});
