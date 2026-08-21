import * as Sentry from '@sentry/react-native';
import {
  hasStoreCode,
  isBillingUnavailableError,
  isUserCancelledError,
  reportIapError,
  resetIapErrorDedup,
} from './errors';

type ScopeMock = {
  setTag: jest.Mock;
  setFingerprint: jest.Mock;
  setContext: jest.Mock;
};

const makeScope = (): ScopeMock => ({
  setTag: jest.fn(),
  setFingerprint: jest.fn(),
  setContext: jest.fn(),
});

// Runs the CaptureContext callback captureException was given, like the SDK does.
const applyScope = (): ScopeMock => {
  const scope = makeScope();
  const call = (Sentry.captureException as jest.Mock).mock.calls[0];
  call[1](scope);
  return scope;
};

const cancelled = {
  code: 'user-cancelled',
  debugMessage: '',
  message: 'User cancelled the operation',
  platform: 'android',
  productId: '499spins',
  subResponseCodeAndroid: 'no-applicable-sub-response-code',
};

beforeEach(() => {
  jest.clearAllMocks();
  resetIapErrorDedup();
});

describe('classifiers', () => {
  it('recognise cancellation by OpenIAP code and by Play response code', () => {
    expect(isUserCancelledError(cancelled)).toBe(true);
    expect(isUserCancelledError({ responseCode: 1 })).toBe(true);
    expect(isUserCancelledError({ code: 'network-error' })).toBe(false);
    expect(isUserCancelledError(undefined)).toBe(false);
  });

  it('tell a store error (string code) from a thrown Error or a bare value', () => {
    expect(hasStoreCode(cancelled)).toBe(true);
    expect(hasStoreCode({ code: 'item-unavailable' })).toBe(true);
    expect(hasStoreCode(new Error('Invalid request for Google.'))).toBe(false);
    expect(hasStoreCode({ code: '' })).toBe(false);
    expect(hasStoreCode('boom')).toBe(false);
    expect(hasStoreCode(undefined)).toBe(false);
  });

  it('recognise billing unavailable by code and by Play response code', () => {
    expect(isBillingUnavailableError({ code: 'billing-unavailable' })).toBe(true);
    expect(isBillingUnavailableError({ responseCode: 3 })).toBe(true);
    expect(isBillingUnavailableError(cancelled)).toBe(false);
  });
});

describe('reportIapError', () => {
  it('turns a user cancellation into a breadcrumb, never an exception', () => {
    expect(reportIapError(cancelled, { stage: 'purchase' })).toBe('cancelled');

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'iap',
        level: 'info',
        data: { stage: 'purchase', productId: '499spins' },
      }),
    );
  });

  it('also treats the Play response code 1 as a cancellation', () => {
    reportIapError({ responseCode: 1, message: 'cancelled' }, { stage: 'purchase' });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('captures a store error as an IapError fingerprinted by code', () => {
    const report = reportIapError(
      {
        code: 'billing-unavailable',
        message: 'Billing API version is not supported',
        debugMessage: 'Play Store is blocked.',
        platform: 'android',
        productId: '999accounts',
        responseCode: 3,
      },
      { stage: 'purchase' },
    );

    expect(report).toBe('reported');
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const [captured] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(captured).toBeInstanceOf(Error);
    expect(captured.name).toBe('IapError');
    expect(captured.message).toBe('IAP billing-unavailable: Billing API version is not supported');

    const scope = applyScope();
    expect(scope.setFingerprint).toHaveBeenCalledWith(['iap', 'billing-unavailable']);
    expect(scope.setTag).toHaveBeenCalledWith('iap.stage', 'purchase');
    expect(scope.setTag).toHaveBeenCalledWith('iap.code', 'billing-unavailable');
    expect(scope.setTag).toHaveBeenCalledWith('iap.product', '999accounts');
    expect(scope.setTag).toHaveBeenCalledWith('iap.platform', 'android');
    expect(scope.setContext).toHaveBeenCalledWith(
      'iap',
      expect.objectContaining({
        code: 'billing-unavailable',
        debugMessage: 'Play Store is blocked.',
        responseCode: 3,
      }),
    );
  });

  it('gives different store codes different fingerprints', () => {
    reportIapError({ code: 'item-unavailable', message: 'x' }, { stage: 'request', sku: 'a' });
    reportIapError({ code: 'developer-error', message: 'y' }, { stage: 'request', sku: 'a' });

    const fingerprints = (Sentry.captureException as jest.Mock).mock.calls.map((call) => {
      const scope = makeScope();
      call[1](scope);
      return scope.setFingerprint.mock.calls[0][0];
    });
    expect(fingerprints).toEqual([
      ['iap', 'item-unavailable'],
      ['iap', 'developer-error'],
    ]);
  });

  it('falls back to the sku from context when the store error carries no productId', () => {
    reportIapError(
      { code: 'item-unavailable', message: 'x' },
      { stage: 'request', sku: '499spins' },
    );
    const scope = applyScope();
    expect(scope.setTag).toHaveBeenCalledWith('iap.product', '499spins');
  });

  it('keeps an expo-iap rejection (Error with code) and still fingerprints by code', () => {
    // expo-iap's createPurchaseError: new Error(message) with the store fields attached.
    const rejection: any = new Error('Billing API version is not supported');
    rejection.name = '[expo-iap]: PurchaseError';
    rejection.code = 'billing-unavailable';
    rejection.responseCode = 3;
    rejection.debugMessage = 'Billing Unavailable';
    rejection.platform = 'android';
    rejection.productId = '999accounts';

    reportIapError(rejection, { stage: 'init' });

    const [captured] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(captured).toBe(rejection);
    const scope = applyScope();
    expect(scope.setFingerprint).toHaveBeenCalledWith(['iap', 'billing-unavailable']);
    expect(scope.setTag).toHaveBeenCalledWith('iap.code', 'billing-unavailable');
    expect(scope.setTag).toHaveBeenCalledWith('iap.product', '999accounts');
    expect(scope.setContext).toHaveBeenCalledWith(
      'iap',
      expect.objectContaining({
        code: 'billing-unavailable',
        debugMessage: 'Billing Unavailable',
      }),
    );
  });

  it('treats an expo-iap cancellation rejection like the listener payload', () => {
    const rejection: any = new Error('User cancelled the operation');
    rejection.code = 'user-cancelled';
    reportIapError(rejection, { stage: 'request', sku: '499spins' });
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1);
  });

  it('captures a thrown Error as-is, tagged with the stage and without a store fingerprint', () => {
    const thrown = new Error('Email and username are required for 999accounts consumption');
    reportIapError(thrown, { stage: 'recover' });

    const [captured] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(captured).toBe(thrown);
    const scope = applyScope();
    expect(scope.setTag).toHaveBeenCalledWith('iap.stage', 'recover');
    expect(scope.setFingerprint).not.toHaveBeenCalled();
    expect(scope.setContext).not.toHaveBeenCalled();
  });

  it('wraps a non-Error, non-store value so Sentry still gets a stack', () => {
    reportIapError('boom', { stage: 'init' });
    const [captured] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(captured).toBeInstanceOf(Error);
    expect(captured.message).toBe('IAP init failed: boom');
  });
});

describe('reportIapError duplicate delivery', () => {
  const storeError = {
    code: 'not-prepared',
    message: 'Billing client not ready',
    productId: '499spins',
  };

  it('reports the first arrival and flags the second within the window, in either order', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    expect(reportIapError(storeError, { stage: 'purchase' })).toBe('reported');
    expect(reportIapError(storeError, { stage: 'request', sku: '499spins' })).toBe('duplicate');
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);

    resetIapErrorDedup();
    jest.clearAllMocks();
    expect(reportIapError(storeError, { stage: 'request', sku: '499spins' })).toBe('reported');
    expect(reportIapError(storeError, { stage: 'purchase' })).toBe('duplicate');
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('does not breadcrumb a cancellation twice', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    expect(reportIapError(cancelled, { stage: 'purchase' })).toBe('cancelled');
    expect(reportIapError(cancelled, { stage: 'request', sku: '499spins' })).toBe('duplicate');
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1);
  });

  it('reports again once the window has passed', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    reportIapError(storeError, { stage: 'purchase' });
    now.mockReturnValue(7_000);
    expect(reportIapError(storeError, { stage: 'purchase' })).toBe('reported');
    expect(Sentry.captureException).toHaveBeenCalledTimes(2);
  });

  it('keeps different products and codes apart', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    reportIapError(storeError, { stage: 'purchase' });
    expect(reportIapError({ ...storeError, productId: '999accounts' }, { stage: 'purchase' })).toBe(
      'reported',
    );
    expect(reportIapError({ ...storeError, code: 'item-unavailable' }, { stage: 'purchase' })).toBe(
      'reported',
    );
    expect(Sentry.captureException).toHaveBeenCalledTimes(3);
  });

  it('never dedups errors without a store code', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    const thrown = new Error('Invalid request for Google.');
    expect(reportIapError(thrown, { stage: 'request', sku: 'a' })).toBe('reported');
    expect(reportIapError(thrown, { stage: 'request', sku: 'a' })).toBe('reported');
  });
});
