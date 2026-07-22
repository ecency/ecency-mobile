import { Platform } from 'react-native';

/**
 * Single entry point for store purchases, so the rest of the app does not care
 * which library backs a platform.
 *
 * Android runs on expo-iap (Google Play Billing 9). Play requires Billing 8+ for
 * updates from Aug 31, 2026 and react-native-iap 12 pins Billing 7.0.0, with no
 * 12.x/13.x release that ships a newer one.
 *
 * iOS stays on react-native-iap: expo-iap exposes only the StoreKit 2 JWS token,
 * while /private-api/purchase-order still verifies the legacy base64 App Store
 * receipt. Moving iOS over needs that verification changed first.
 *
 * Each platform ships exactly one billing implementation: react-native-iap is
 * unlinked from Android in react-native.config.js (so Billing 7 classes stay out
 * of the AAB, which is what Play checks), and expo-iap is excluded from the Apple
 * build via `expo.autolinking` in package.json. The requires below are therefore
 * lazy on purpose -- the module that is not linked is never evaluated.
 */

const IS_ANDROID = Platform.OS === 'android';

const iap = IS_ANDROID ? require('expo-iap') : require('react-native-iap');

// Shape the screens already render (react-native-iap's product shape).
export interface IapProduct {
  productId: string;
  title: string;
  description?: string;
  price: string;
  currency: string;
  localizedPrice: string;
}

export interface IapPurchase {
  productId: string;
  purchaseToken?: string;
  transactionReceipt?: string;
  [key: string]: any;
}

// Play BillingResponseCode values, reported as `responseCode` by both libraries.
const RESPONSE_CODE_USER_CANCELED = 1;
const RESPONSE_CODE_BILLING_UNAVAILABLE = 3;

// openiap renamed the product fields (id/displayPrice) and returns price as a
// number; map them back to what the screens expect.
const _normalizeProduct = (product: any): IapProduct => ({
  ...product,
  productId: product.id,
  title: product.title,
  description: product.description,
  price: product.price !== null && product.price !== undefined ? String(product.price) : '',
  currency: product.currency,
  localizedPrice: product.displayPrice,
});

// openiap drops transactionReceipt. On Android the receipt sent to the backend is
// the purchase token either way; dataAndroid holds the original purchase JSON and
// stands in for the receipt so purchase handling can keep gating on it.
const _normalizePurchase = (purchase: any): IapPurchase => ({
  ...purchase,
  transactionReceipt: purchase.dataAndroid || purchase.purchaseToken,
});

// Error codes differ per library: react-native-iap raises E_-prefixed codes,
// openiap raises kebab-case ones. Both also carry the numeric Play response code
// on Android.
export const isUserCancelledError = (error: any): boolean =>
  error?.code === 'user-cancelled' ||
  error?.code === 'E_USER_CANCELLED' ||
  error?.responseCode === RESPONSE_CODE_USER_CANCELED;

export const isBillingUnavailableError = (error: any): boolean =>
  error?.code === 'billing-unavailable' ||
  error?.responseCode === RESPONSE_CODE_BILLING_UNAVAILABLE;

export const initConnection = (): Promise<any> => iap.initConnection();

export const endConnection = (): Promise<any> => iap.endConnection();

export const getProducts = async (skus: string[]): Promise<IapProduct[]> => {
  if (IS_ANDROID) {
    const products = await iap.fetchProducts({ skus, type: 'in-app' });
    return (products || []).map(_normalizeProduct);
  }

  return (await iap.getProducts({ skus })) || [];
};

export const getAvailablePurchases = async (): Promise<IapPurchase[]> => {
  const purchases = (await iap.getAvailablePurchases()) || [];
  return IS_ANDROID ? purchases.map(_normalizePurchase) : purchases;
};

export const requestPurchase = (sku: string): Promise<any> => {
  if (IS_ANDROID) {
    return iap.requestPurchase({ request: { google: { skus: [sku] } }, type: 'in-app' });
  }

  return iap.requestPurchase({ sku });
};

export const finishTransaction = ({
  purchase,
  isConsumable,
}: {
  purchase: IapPurchase;
  isConsumable: boolean;
}): Promise<any> => iap.finishTransaction({ purchase, isConsumable });

export const purchaseUpdatedListener = (listener: (purchase: IapPurchase) => void) =>
  iap.purchaseUpdatedListener(
    IS_ANDROID ? (purchase: any) => listener(_normalizePurchase(purchase)) : listener,
  );

export const purchaseErrorListener = (listener: (error: any) => void) =>
  iap.purchaseErrorListener(listener);
