import { addBreadcrumb, captureException } from '../../utils/sentryUtils';

/**
 * Store error classification and reporting.
 *
 * Kept free of the expo-iap import so it can be unit tested, and so the
 * reporting rules live next to the classifiers they depend on.
 *
 * expo-iap delivers a plain `PurchaseError` object ({ code, message, debugMessage,
 * productId, ... }), not an Error instance. Capturing that object directly made
 * Sentry file every store error as one synthetic "Object captured as exception"
 * issue (ECENCY-MOBILE-30G), 94% of which was the user closing the billing sheet,
 * with the remaining codes hidden in the same bucket.
 */

// Play BillingResponseCode values, reported as `responseCode` on Android.
const RESPONSE_CODE_USER_CANCELED = 1;
const RESPONSE_CODE_BILLING_UNAVAILABLE = 3;

export const isUserCancelledError = (error: any): boolean =>
  error?.code === 'user-cancelled' || error?.responseCode === RESPONSE_CODE_USER_CANCELED;

export const isBillingUnavailableError = (error: any): boolean =>
  error?.code === 'billing-unavailable' ||
  error?.responseCode === RESPONSE_CODE_BILLING_UNAVAILABLE;

// A store (OpenIAP) error carries a string `code`; a thrown Error or a JS-side
// validation failure does not. expo-iap delivers a store failure BOTH to
// purchaseErrorListener and as the requestPurchase rejection, so a catch around
// requestPurchase must leave coded errors to the listener or every failure is
// reported twice.
export const hasStoreCode = (error: unknown): boolean =>
  typeof (error as any)?.code === 'string' && (error as any).code.length > 0;

// Where in the purchase flow the error surfaced. Tagged, not fingerprinted, so the
// same store code stays one issue wherever it happens.
export type IapStage = 'init' | 'products' | 'request' | 'purchase' | 'finish' | 'recover';

export interface IapErrorContext {
  stage: IapStage;
  sku?: string;
}

// What reportIapError did with the error, so the caller can decide whether the
// user still needs to hear about it.
export type IapReport = 'reported' | 'cancelled' | 'duplicate';

// expo-iap can deliver one store failure twice: to purchaseErrorListener and as
// the requestPurchase rejection (Android always does both, in that order; iOS
// throws directly and the event depends on the OpenIAP library). Neither arrival
// is guaranteed, so whichever comes first is reported and a second sighting of
// the same code and product inside this window is a duplicate.
const DUPLICATE_WINDOW_MS = 5000;
const _recent = new Map<string, number>();

const _isDuplicate = (key: string, now: number): boolean => {
  _recent.forEach((seenAt, seenKey) => {
    if (now - seenAt > DUPLICATE_WINDOW_MS) {
      _recent.delete(seenKey);
    }
  });
  if (_recent.has(key)) {
    return true;
  }
  _recent.set(key, now);
  return false;
};

// Test hook: clears the duplicate window between cases.
export const resetIapErrorDedup = (): void => {
  _recent.clear();
};

const _stringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

/**
 * Report a store error to Sentry.
 *
 * - A user cancellation is not an error: it leaves a breadcrumb and nothing else.
 * - A store error (anything with a string `code`) is fingerprinted by that code,
 *   so each code is its own Sentry issue. expo-iap rejections are already Error
 *   instances ("[expo-iap]: PurchaseError" with `code` attached) and are captured
 *   as-is to keep their stack; the plain object the purchase-error event delivers
 *   is wrapped in an `IapError` first.
 * - Anything else (a thrown Error, a string) is captured with the stage tag only.
 * - A coded error seen again within DUPLICATE_WINDOW_MS for the same product is
 *   a duplicate delivery and is neither reported nor breadcrumbed again.
 */
export const reportIapError = (error: unknown, context: IapErrorContext): IapReport => {
  const err = error as any;
  const code = hasStoreCode(err) ? (err.code as string) : null;
  const productId = _stringOrNull(err?.productId) ?? context.sku ?? null;

  if (code !== null && _isDuplicate(`${code}|${productId ?? ''}`, Date.now())) {
    return 'duplicate';
  }

  if (isUserCancelledError(err)) {
    addBreadcrumb({
      category: 'iap',
      level: 'info',
      message: 'user cancelled purchase',
      data: { stage: context.stage, productId },
    });
    return 'cancelled';
  }

  const isStoreError = code !== null;
  let toCapture: unknown = error;
  if (!(error instanceof Error)) {
    const normalized = new Error(
      isStoreError
        ? `IAP ${code}: ${_stringOrNull(err?.message) ?? 'store error'}`
        : `IAP ${context.stage} failed: ${String(error)}`,
    );
    normalized.name = 'IapError';
    toCapture = normalized;
  }

  captureException(toCapture, (scope) => {
    scope.setTag('iap.stage', context.stage);
    if (code) {
      scope.setTag('iap.code', code);
    }
    if (productId) {
      scope.setTag('iap.product', productId);
    }
    const platform = _stringOrNull(err?.platform);
    if (platform) {
      scope.setTag('iap.platform', platform);
    }
    if (isStoreError) {
      scope.setFingerprint(['iap', code as string]);
      scope.setContext('iap', {
        code,
        message: err?.message ?? null,
        debugMessage: err?.debugMessage ?? null,
        responseCode: err?.responseCode ?? null,
        subResponseCodeAndroid: err?.subResponseCodeAndroid ?? null,
        productId,
      });
    }
  });
  return 'reported';
};
