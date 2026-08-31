import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  TimedRequestConfig,
  isAxiosTimeoutError,
  isAxiosTransportError,
  stampRequestStart,
} from './axiosTimeout';

const makeConfig = (timeout: number, startedAt?: number): TimedRequestConfig =>
  ({
    timeout,
    ...(startedAt === undefined ? {} : { metadata: { startedAt } }),
  } as TimedRequestConfig);

const makeError = (code: string, config?: InternalAxiosRequestConfig) =>
  new AxiosError('failed', code, config);

describe('stampRequestStart', () => {
  it('records when the request left', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    const request = {} as InternalAxiosRequestConfig;

    const result = stampRequestStart(request);

    expect(result).toBe(request);
    expect((request as TimedRequestConfig).metadata).toEqual({ startedAt: 1_000_000 });
    jest.restoreAllMocks();
  });
});

describe('isAxiosTimeoutError', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('recognises the code iOS produces for an expired deadline', () => {
    expect(isAxiosTimeoutError(makeError('ECONNABORTED'))).toBe(true);
  });

  it('recognises the clarified timeout code', () => {
    expect(isAxiosTimeoutError(makeError('ETIMEDOUT'))).toBe(true);
  });

  it('recognises the generic transport failure Android reports for an expired deadline', () => {
    jest.spyOn(Date, 'now').mockReturnValue(21_000);
    const error = makeError('ERR_NETWORK', makeConfig(20000, 1_000));

    expect(isAxiosTimeoutError(error)).toBe(true);
  });

  it('accepts a native deadline that fired just before this read of the clock', () => {
    // The elapsed check must allow a little slack, or a timeout that fires a few
    // milliseconds early is reported as a plain connection failure.
    jest.spyOn(Date, 'now').mockReturnValue(20_900);
    const error = makeError('ERR_NETWORK', makeConfig(20000, 1_000));

    expect(isAxiosTimeoutError(error)).toBe(true);
  });

  it('does not call a fast connection failure a timeout', () => {
    // The case that makes the elapsed check necessary: offline fails instantly
    // with the same code an expired Android deadline produces.
    jest.spyOn(Date, 'now').mockReturnValue(1_300);
    const error = makeError('ERR_NETWORK', makeConfig(20000, 1_000));

    expect(isAxiosTimeoutError(error)).toBe(false);
  });

  it('does not guess when the request carried no deadline', () => {
    jest.spyOn(Date, 'now').mockReturnValue(999_999);
    const error = makeError('ERR_NETWORK', makeConfig(0, 1_000));

    expect(isAxiosTimeoutError(error)).toBe(false);
  });

  it('does not guess when the request was never stamped', () => {
    jest.spyOn(Date, 'now').mockReturnValue(999_999);
    const error = makeError('ERR_NETWORK', makeConfig(20000));

    expect(isAxiosTimeoutError(error)).toBe(false);
  });

  it.each([
    ['a server answer', 'ERR_BAD_REQUEST'],
    ['a cancelled request', 'ERR_CANCELED'],
  ])('leaves %s alone', (_label, code) => {
    expect(isAxiosTimeoutError(makeError(code))).toBe(false);
  });

  it('ignores anything that is not an axios error', () => {
    expect(isAxiosTimeoutError(new Error('ECONNABORTED'))).toBe(false);
    expect(isAxiosTimeoutError(undefined)).toBe(false);
  });
});

describe('isAxiosTransportError', () => {
  it.each([['ECONNABORTED'], ['ETIMEDOUT'], ['ERR_NETWORK']])(
    'treats %s as a failure where no response arrived',
    (code) => {
      expect(isAxiosTransportError(makeError(code))).toBe(true);
    },
  );

  it('does not treat a server answer as a transport failure', () => {
    expect(isAxiosTransportError(makeError('ERR_BAD_RESPONSE'))).toBe(false);
  });

  it('ignores anything that is not an axios error', () => {
    expect(isAxiosTransportError(new Error('ERR_NETWORK'))).toBe(false);
  });
});
