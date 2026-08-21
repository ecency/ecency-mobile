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

// Where in the purchase flow the error surfaced. Tagged, not fingerprinted, so the
// same store code stays one issue wherever it happens.
export type IapStage = 'init' | 'products' | 'request' | 'purchase' | 'finish' | 'recover';

export interface IapErrorContext {
  stage: IapStage;
  sku?: string;
}

const _stringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

/**
 * Report a store error to Sentry.
 *
 * - A user cancellation is not an error: it leaves a breadcrumb and nothing else.
 * - A `PurchaseError` object becomes a real `IapError` whose message and
 *   fingerprint carry the store code, so each code is its own Sentry issue.
 * - Anything else (a thrown Error, a string) is captured as-is with the same tags.
 */
export const reportIapError = (error: unknown, context: IapErrorContext): void => {
  const err = error as any;
  const code = _stringOrNull(err?.code);
  const productId = _stringOrNull(err?.productId) ?? context.sku ?? null;

  if (isUserCancelledError(err)) {
    addBreadcrumb({
      category: 'iap',
      level: 'info',
      message: 'user cancelled purchase',
      data: { stage: context.stage, productId },
    });
    return;
  }

  const isStoreError = code !== null && !(error instanceof Error);
  let toCapture: unknown = error;
  if (isStoreError) {
    const message = _stringOrNull(err?.message) ?? 'store error';
    const normalized = new Error(`IAP ${code}: ${message}`);
    normalized.name = 'IapError';
    toCapture = normalized;
  } else if (!(error instanceof Error)) {
    const normalized = new Error(`IAP ${context.stage} failed: ${String(error)}`);
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
};
