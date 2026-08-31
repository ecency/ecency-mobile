import { retryDelay, shouldRetryQuery } from './retryPolicy';

const withStatus = (status: number) => ({ response: { status } });

describe('shouldRetryQuery', () => {
  it('retries a timeout once and then gives up', () => {
    const timeout = Object.assign(new Error('Request timed out'), { name: 'TimeoutError' });

    expect(shouldRetryQuery(0, timeout)).toBe(true);
    expect(shouldRetryQuery(1, timeout)).toBe(false);
    expect(shouldRetryQuery(2, timeout)).toBe(false);
  });

  it('retries a transport failure with no status once', () => {
    expect(shouldRetryQuery(0, new Error('Network request failed'))).toBe(true);
    expect(shouldRetryQuery(1, new Error('Network request failed'))).toBe(false);
  });

  it('never retries a query React Query cancelled itself', () => {
    // A retry here resurrects work the app deliberately dropped on unmount or on
    // a key change, and it is not a failure the user should ever see.
    const aborted = Object.assign(new Error('Aborted'), { name: 'AbortError' });

    expect(shouldRetryQuery(0, aborted)).toBe(false);
  });

  it.each([[400], [401], [403], [404], [422]])(
    'never retries %s, which the server will answer the same way',
    (status) => {
      expect(shouldRetryQuery(0, withStatus(status))).toBe(false);
    },
  );

  it.each([[408], [425], [429], [500], [502], [503], [504]])(
    'retries %s once, where a second attempt can plausibly help',
    (status) => {
      expect(shouldRetryQuery(0, withStatus(status))).toBe(true);
      expect(shouldRetryQuery(1, withStatus(status))).toBe(false);
    },
  );

  it('reads a status set directly on the error as well as one under response', () => {
    expect(shouldRetryQuery(0, { status: 404 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 503 })).toBe(true);
  });
});

describe('retryDelay', () => {
  it('backs off and stays capped', () => {
    expect(retryDelay(0)).toBe(1000);
    expect(retryDelay(1)).toBe(2000);
    expect(retryDelay(10)).toBe(8000);
  });
});
