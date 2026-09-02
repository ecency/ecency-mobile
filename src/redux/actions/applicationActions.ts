import getSymbolFromCurrency from 'currency-symbol-map';
import { getCurrencyRate } from '@ecency/sdk';
import {
  CHANGE_COMMENT_NOTIFICATION,
  CHANGE_FOLLOW_NOTIFICATION,
  CHANGE_MENTION_NOTIFICATION,
  CHANGE_FAVORITE_NOTIFICATION,
  CHANGE_BOOKMARK_NOTIFICATION,
  CHANGE_TAGS_NOTIFICATION,
  CHANGE_REBLOG_NOTIFICATION,
  CHANGE_TRANSFERS_NOTIFICATION,
  CHANGE_SCHEDULED_PUBLISHED_NOTIFICATION,
  CHANGE_DELEGATIONS_NOTIFICATION,
  CHANGE_PAYOUTS_NOTIFICATION,
  CHANGE_ACCOUNT_UPDATE_NOTIFICATION,
  CHANGE_WEEKLY_EARNINGS_NOTIFICATION,
  CHANGE_ALL_NOTIFICATION_SETTINGS,
  CHANGE_VOTE_NOTIFICATION,
  IS_CONNECTED,
  IS_DARK_THEME,
  IS_DEFAULT_FOOTER,
  IS_LOGIN_DONE,
  IS_NOTIFICATION_OPEN,
  SET_FCM_AVAILABLE,
  LOGIN,
  SET_API,
  SET_CURRENCY,
  SET_LANGUAGE,
  SET_NSFW,
  SET_PIN_CODE,
  IS_PIN_CODE_OPEN,
  IS_RENDER_REQUIRED,
  SET_LAST_APP_VERSION,
  SET_COLOR_THEME,
  SET_SETTINGS_MIGRATED,
  HIDE_POSTS_THUMBNAILS,
  SET_TERMS_ACCEPTED,
  SET_IS_BIOMETRIC_ENABLED,
  SET_ENC_UNLOCK_PIN,
  SET_POST_UPVOTE_PERCENT,
  SET_COMMENT_UPVOTE_PERCENT,
  SET_WAVE_UPVOTE_PERCENT,
  SET_IMAGE_SERVER,
  UPDATE_APP_RATING_META,
} from '../constants/constants';
import { requestInAppReview } from '../../utils/storeReview';

export const login = (payload: any) => ({
  payload,
  type: LOGIN,
});

export const isLoginDone = () => ({
  type: IS_LOGIN_DONE,
});

// Settings actions
export const setLanguage = (payload: any) => ({
  payload,
  type: SET_LANGUAGE,
});

export const setApi = (payload: any) => ({
  payload,
  type: SET_API,
});

export const setPostUpvotePercent = (payload: any) => ({
  payload,
  type: SET_POST_UPVOTE_PERCENT,
});

export const setCommentUpvotePercent = (payload: any) => ({
  payload,
  type: SET_COMMENT_UPVOTE_PERCENT,
});
export const setWaveUpvotePercent = (payload: any) => ({
  payload,
  type: SET_WAVE_UPVOTE_PERCENT,
});

export const changeAllNotificationSettings = (payload: any) => ({
  payload,
  type: CHANGE_ALL_NOTIFICATION_SETTINGS,
});

export const setFCMAvailable = (payload: boolean) => ({
  payload,
  type: SET_FCM_AVAILABLE,
});

export const changeNotificationSettings = (payload: any) => {
  switch (payload.type) {
    case 'notification.follow':
      return {
        payload: payload.action,
        type: CHANGE_FOLLOW_NOTIFICATION,
      };

    case 'notification.vote':
      return {
        payload: payload.action,
        type: CHANGE_VOTE_NOTIFICATION,
      };

    case 'notification.comment':
      return {
        payload: payload.action,
        type: CHANGE_COMMENT_NOTIFICATION,
      };

    case 'notification.mention':
      return {
        payload: payload.action,
        type: CHANGE_MENTION_NOTIFICATION,
      };

    case 'notification.favorite':
      return {
        payload: payload.action,
        type: CHANGE_FAVORITE_NOTIFICATION,
      };

    case 'notification.bookmark':
      return {
        payload: payload.action,
        type: CHANGE_BOOKMARK_NOTIFICATION,
      };

    case 'notification.tags':
      return {
        payload: payload.action,
        type: CHANGE_TAGS_NOTIFICATION,
      };

    case 'notification.reblog':
      return {
        payload: payload.action,
        type: CHANGE_REBLOG_NOTIFICATION,
      };

    case 'notification.transfers':
      return {
        payload: payload.action,
        type: CHANGE_TRANSFERS_NOTIFICATION,
      };

    case 'notification.scheduledPublished':
      return {
        payload: payload.action,
        type: CHANGE_SCHEDULED_PUBLISHED_NOTIFICATION,
      };

    case 'notification.delegations':
      return {
        payload: payload.action,
        type: CHANGE_DELEGATIONS_NOTIFICATION,
      };

    case 'notification.payouts':
      return {
        payload: payload.action,
        type: CHANGE_PAYOUTS_NOTIFICATION,
      };

    case 'notification.accountUpdate':
      return {
        payload: payload.action,
        type: CHANGE_ACCOUNT_UPDATE_NOTIFICATION,
      };

    case 'notification.weeklyEarnings':
      return {
        payload: payload.action,
        type: CHANGE_WEEKLY_EARNINGS_NOTIFICATION,
      };

    case 'notification':
      return {
        payload: payload.action,
        type: IS_NOTIFICATION_OPEN,
      };

    default:
      return null;
  }
};

export const setIsDarkTheme = (payload: any) => ({
  payload,
  type: IS_DARK_THEME,
});

export const setColorTheme = (payload: number) => ({
  payload,
  type: SET_COLOR_THEME,
});

export const isPinCodeOpen = (payload: any) => ({
  payload,
  type: IS_PIN_CODE_OPEN,
});

export const setConnectivityStatus = (payload: any) => ({
  payload,
  type: IS_CONNECTED,
});

export const setNsfw = (payload: any) => ({
  payload,
  type: SET_NSFW,
});

export const isDefaultFooter = (payload: any) => ({
  payload,
  type: IS_DEFAULT_FOOTER,
});

/**
 * MW
 */
export const setCurrency = (currency: any) => async (dispatch: any) => {
  const currencySymbol = getSymbolFromCurrency(currency);

  let currencyRate = 1;
  if (currency !== 'usd') {
    try {
      const _usdRate = await getCurrencyRate('usd');
      const _fiatRate = await getCurrencyRate(currency);
      currencyRate = _fiatRate / _usdRate;
    } catch (err) {
      currencyRate = 1;
    }
  }

  dispatch({
    type: SET_CURRENCY,
    payload: { currency, currencyRate, currencySymbol },
  });
};

export const setPinCode = (data: any) => ({
  type: SET_PIN_CODE,
  payload: data,
});

export const isRenderRequired = (payload: any) => ({
  payload,
  type: IS_RENDER_REQUIRED,
});

export const setLastAppVersion = (versionNumber: string) => ({
  payload: versionNumber,
  type: SET_LAST_APP_VERSION,
});

export const setSettingsMigrated = (isMigrated: boolean) => ({
  payload: isMigrated,
  type: SET_SETTINGS_MIGRATED,
});

export const setHidePostsThumbnails = (shouldHide: boolean) => ({
  payload: shouldHide,
  type: HIDE_POSTS_THUMBNAILS,
});

export const setIsTermsAccepted = (isTermsAccepted: boolean) => ({
  payload: isTermsAccepted,
  type: SET_TERMS_ACCEPTED,
});

export const setIsBiometricEnabled = (enabled: boolean) => ({
  payload: enabled,
  type: SET_IS_BIOMETRIC_ENABLED,
});

export const setEncryptedUnlockPin = (encryptedUnlockPin: string) => ({
  payload: encryptedUnlockPin,
  type: SET_ENC_UNLOCK_PIN,
});

export const setImageServer = (server: string) => ({
  payload: server,
  type: SET_IMAGE_SERVER,
});

// ----- In-app store review prompt -----

// Eligibility thresholds for the automatic review prompt. Tunable in one place:
// bump MIN_DAYS_SINCE_FIRST_USE to 7 for a more conservative gate.
const MIN_DAYS_SINCE_FIRST_USE = 3;
const MIN_SESSION_COUNT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
// Small delay so the native sheet surfaces after the triggering action's UI
// (toast / popover close / navigation) has settled rather than on top of it.
const REVIEW_PROMPT_DELAY_MS = 1200;

// In-memory guard so two positive actions landing inside the delay window can't
// each schedule a prompt. Kept module-level (not persisted) so a process kill
// mid-timeout resets on next launch rather than wedging the flag forever.
let reviewRequestInFlight = false;

export const updateAppRatingMeta = (payload: {
  firstUseTime?: number | null;
  sessionCount?: number;
  hasRequestedReview?: boolean;
}) => ({
  payload,
  type: UPDATE_APP_RATING_META,
});

/**
 * Record an app session (cold start or return to foreground). Stamps the
 * first-use time once and increments the session counter — the inputs the
 * review prompt eligibility check relies on.
 */
export const recordAppSession = () => (dispatch: any, getState: any) => {
  // appRating can be undefined for users upgrading from a build before this
  // feature: redux-persist's autoMergeLevel1 replaces the whole persisted
  // `application` slice, so the new key isn't defaulted from initialState until
  // the first write. Guard the read so this mount-time thunk can't crash launch.
  const { appRating } = getState().application;
  dispatch(
    updateAppRatingMeta({
      firstUseTime: appRating?.firstUseTime ?? Date.now(),
      sessionCount: (appRating?.sessionCount ?? 0) + 1,
    }),
  );
};

/**
 * Request the OS in-app review prompt if the user looks engaged: used the app
 * for at least a few days, opened it several times, and hasn't been prompted
 * before. Call this only after a positive action (e.g. publishing a post or
 * casting a vote). No-ops silently when not eligible.
 */
export const maybeRequestReview = () => (dispatch: any, getState: any) => {
  const { appRating } = getState().application;
  const { firstUseTime, sessionCount = 0, hasRequestedReview } = appRating ?? {};

  if (hasRequestedReview || reviewRequestInFlight || !firstUseTime) {
    return;
  }

  const daysSinceFirstUse = (Date.now() - firstUseTime) / DAY_MS;
  if (daysSinceFirstUse < MIN_DAYS_SINCE_FIRST_USE || sessionCount < MIN_SESSION_COUNT) {
    return;
  }

  // Claim the slot synchronously so a second action in the delay window bails
  // at the guard above instead of scheduling its own prompt.
  reviewRequestInFlight = true;
  setTimeout(async () => {
    try {
      const requested = await requestInAppReview();
      if (requested) {
        dispatch(updateAppRatingMeta({ hasRequestedReview: true }));
      }
    } finally {
      reviewRequestInFlight = false;
    }
  }, REVIEW_PROMPT_DELAY_MS);
};
