import * as iap from 'expo-iap';

export { isBillingUnavailableError, isUserCancelledError, reportIapError } from './errors';
export type { IapErrorContext, IapStage } from './errors';

/**
 * Single entry point for store purchases.
 *
 * Both platforms run on expo-iap (OpenIAP): Google Play Billing 9 on Android and
 * StoreKit 2 on iOS. Play requires Billing 8+ for updates from Aug 31, 2026 and
 * react-native-iap 12 pinned Billing 7, which is what forced the library change.
 *
 * The receipt posted to /private-api/purchase-order is `purchaseToken` on both
 * platforms: the Play purchase token on Android (unchanged), and the StoreKit 2
 * signed transaction (Transaction.jwsRepresentation) on iOS, which ePoints
 * verifies with Apple's App Store Server Library. Older app versions keep sending
 * legacy base64 App Store receipts and are still verified server-side, so this
 * does not strand anyone who has not updated.
 *
 * OpenIAP's product payload is mapped back to the fields the screens render, so
 * nothing outside this module deals with store shapes.
 */

// Shape the screens render.
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
  [key: string]: any;
}

export interface IapSubscription {
  remove: () => void;
}

// OpenIAP names products id/displayPrice and returns price as a number.
const _normalizeProduct = (product: any): IapProduct => ({
  ...product,
  productId: product.id,
  title: product.title,
  description: product.description,
  price: product.price !== null && product.price !== undefined ? String(product.price) : '',
  currency: product.currency,
  localizedPrice: product.displayPrice,
});

export const initConnection = (): Promise<any> => iap.initConnection();

export const endConnection = (): Promise<any> => iap.endConnection();

export const getProducts = async (skus: string[]): Promise<IapProduct[]> => {
  const products = await iap.fetchProducts({ skus, type: 'in-app' });
  return ((products as any[]) || []).map(_normalizeProduct);
};

export const getAvailablePurchases = async (): Promise<IapPurchase[]> =>
  (((await iap.getAvailablePurchases()) as any[]) || []) as IapPurchase[];

// The outcome arrives through purchaseUpdatedListener, not this promise.
export const requestPurchase = (sku: string): Promise<any> =>
  iap.requestPurchase({
    request: { apple: { sku }, google: { skus: [sku] } },
    type: 'in-app',
  }) as Promise<any>;

export const finishTransaction = ({
  purchase,
  isConsumable,
}: {
  purchase: IapPurchase;
  isConsumable: boolean;
}): Promise<any> => iap.finishTransaction({ purchase: purchase as any, isConsumable });

export const purchaseUpdatedListener = (
  listener: (purchase: IapPurchase) => void,
): IapSubscription => iap.purchaseUpdatedListener(listener as any);

export const purchaseErrorListener = (listener: (error: any) => void): IapSubscription =>
  iap.purchaseErrorListener(listener as any);
