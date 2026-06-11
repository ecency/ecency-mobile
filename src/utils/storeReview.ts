import { Linking, Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';

// App identifiers used to build store-listing fallback URLs. These mirror the
// values already used by the in-app update flow in applicationContainer.tsx.
const IOS_APP_STORE_ID = '1451896376';
const ANDROID_PACKAGE = 'app.esteem.mobile.android';

/**
 * Ask the OS to show its native in-app review prompt
 * (iOS SKStoreReviewController / Android Google Play In-App Review).
 *
 * The OS decides whether to actually display anything and silently rate-limits
 * how often it appears, so callers must NOT show their own "thanks for rating"
 * UI afterwards. Returns true only when the request was dispatched to the OS.
 * Never throws — if the native module is unavailable (e.g. JS reloaded before a
 * native rebuild) it resolves false so callers can fall back gracefully.
 */
export const requestInAppReview = async (): Promise<boolean> => {
  try {
    if (!(await StoreReview.isAvailableAsync())) {
      return false;
    }
    await StoreReview.requestReview();
    return true;
  } catch (err) {
    console.warn('requestInAppReview failed', err);
    return false;
  }
};

/**
 * Build the store-listing URL. The native deep link (itms-apps / market) opens
 * the store app directly; the https form is a fallback when that scheme can't be
 * handled (e.g. sideloaded builds without the store app installed).
 */
export const getStoreListingUrl = (web = false): string => {
  if (Platform.OS === 'ios') {
    return web
      ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`
      : `itms-apps://itunes.apple.com/app/apple-store/id${IOS_APP_STORE_ID}?action=write-review`;
  }
  return web
    ? `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
    : `market://details?id=${ANDROID_PACKAGE}`;
};

/**
 * Open the public store listing so the user can leave a review manually. Unlike
 * requestInAppReview this always navigates somewhere, which is why it backs the
 * explicit "Rate the app" button in Settings.
 */
export const openStoreListing = async (): Promise<void> => {
  const deepUrl = getStoreListingUrl(false);
  try {
    const canOpenDeepLink = await Linking.canOpenURL(deepUrl);
    await Linking.openURL(canOpenDeepLink ? deepUrl : getStoreListingUrl(true));
  } catch (err) {
    console.warn('openStoreListing failed', err);
    try {
      await Linking.openURL(getStoreListingUrl(true));
    } catch {
      // best-effort: nothing more we can do if even the web URL won't open
    }
  }
};
