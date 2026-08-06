import * as Sentry from '@sentry/react-native';
import type { Scope } from '@sentry/react-native';

// Sentry's CaptureContext callback form must return the scope it received;
// these wrappers accept a plain mutator so call sites stay cast-free.
export const captureException = (error: unknown, applyScope?: (scope: Scope) => void) =>
  Sentry.captureException(error, (scope) => {
    applyScope?.(scope);
    return scope;
  });

export const captureMessage = (message: string, applyScope?: (scope: Scope) => void) =>
  Sentry.captureMessage(message, (scope) => {
    applyScope?.(scope);
    return scope;
  });
