/**
 * The module installs itself on import, so each case re-imports it inside an
 * isolated module registry with a fresh global `fetch` in place.
 */
const loadModule = () => {
  let mod: typeof import('./installFetchDeadline');
  jest.isolateModules(() => {
    mod = require('./installFetchDeadline');
  });
  return mod!;
};

describe('installFetchDeadline', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('replaces the global fetch with a wrapper that bounds the request', async () => {
    jest.useFakeTimers();
    const baseFetch = jest.fn(
      (_input: any, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );
    globalThis.fetch = baseFetch as unknown as typeof fetch;

    loadModule();
    expect(globalThis.fetch).not.toBe(baseFetch);

    const promise = globalThis.fetch('https://ecency.com/private-api/x');
    jest.advanceTimersByTime(120000);

    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('installs once, so a second call cannot stack a second deadline', async () => {
    const baseFetch = jest.fn(async () => ({} as Response));
    globalThis.fetch = baseFetch as unknown as typeof fetch;

    const mod = loadModule();
    const afterFirstInstall = globalThis.fetch;
    mod.installFetchDeadline();

    expect(globalThis.fetch).toBe(afterFirstInstall);

    // One layer of wrapping means exactly one call reaches the base fetch.
    await globalThis.fetch('https://ecency.com/x');
    expect(baseFetch).toHaveBeenCalledTimes(1);
  });

  it('leaves the global alone when there is no fetch to wrap', () => {
    // @ts-expect-error deliberately removing the global for this case
    delete globalThis.fetch;

    loadModule();

    expect(globalThis.fetch).toBeUndefined();
  });
});
