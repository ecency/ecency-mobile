import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/** Request config with the start stamp the timeout classifier below needs. */
export type TimedRequestConfig = InternalAxiosRequestConfig & { metadata?: { startedAt: number } };

/**
 * Request interceptor: stamp the moment the request left, so a response error can
 * be measured against the configured deadline. See `isAxiosTimeoutError`.
 */
export const stampRequestStart = <T extends InternalAxiosRequestConfig>(request: T): T => {
  (request as TimedRequestConfig).metadata = { startedAt: Date.now() };
  return request;
};

/**
 * Slack for the gap between the native deadline firing and this JS read of the
 * clock. Generous on purpose: mislabelling a real timeout as a network error is
 * the failure that matters here, and the elapsed-time check is only ever reached
 * for a request that already carried a deadline.
 */
const ELAPSED_SLACK_MS = 250;

/**
 * True when the request ended because its own deadline expired, rather than
 * because the server answered or the connection failed outright.
 *
 * iOS reports a timeout as a timeout and axios produces 'ECONNABORTED'
 * ('ETIMEDOUT' when `clarifyTimeoutError` is on). Android does not: React Native
 * flags the XHR `timeout` event only when the native failure class is exactly
 * SocketTimeoutException (ResponseUtil.onRequestError), and an expired OkHttp
 * callTimeout raises InterruptedIOException instead, so axios sees a generic
 * transport failure and produces 'ERR_NETWORK'. Recognising 'ERR_NETWORK' alone
 * would relabel every offline failure as a timeout, so it is only accepted when
 * the request also ran for as long as it was allowed to.
 */
export const isAxiosTimeoutError = (error: unknown): error is AxiosError => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }
  if (error.code !== 'ERR_NETWORK') {
    return false;
  }

  const config = error.config as TimedRequestConfig | undefined;
  const limit = config?.timeout ?? 0;
  const startedAt = config?.metadata?.startedAt;
  if (!limit || !startedAt) {
    return false;
  }
  return Date.now() - startedAt >= limit - ELAPSED_SLACK_MS;
};

/**
 * True for any failure where no HTTP response ever arrived: a timeout or a
 * transport error. Callers that report errors use this to keep a broken network
 * path from filling crash reporting with one event per request.
 */
export const isAxiosTransportError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  return (
    error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ERR_NETWORK'
  );
};
