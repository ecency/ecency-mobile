import getSymbolFromCurrency from 'currency-symbol-map';
import { getCurrencyRate } from '../../providers/ecency/ecency';
import {
  CHANGE_COMMENT_NOTIFICATION,
  CHANGE_FOLLOW_NOTIFICATION,
  CHANGE_MENTION_NOTIFICATION,
  CHANGE_FAVORITE_NOTIFICATION,
  CHANGE_BOOKMARK_NOTIFICATION,
  CHANGE_REBLOG_NOTIFICATION,
  CHANGE_TRANSFERS_NOTIFICATION,
  CHANGE_ALL_NOTIFICATION_SETTINGS,
  CHANGE_VOTE_NOTIFICATION,
  IS_CONNECTED,
  IS_DARK_THEME,
  IS_DEFAULT_FOOTER,
  IS_LOGIN_DONE,
  IS_NOTIFICATION_OPEN,
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
} from '../constants/constants';

export const login = (payload) => ({
  payload,
  type: LOGIN,
});



export const isLoginDone = () => ({
  type: IS_LOGIN_DONE,
});

// Settings actions
export const setLanguage = (payload) => ({
  payload,
  type: SET_LANGUAGE,
});

export const setApi = (payload) => ({
  payload,
  type: SET_API,
});

export const setPostUpvotePercent = (payload) => ({
  payload,
  type: SET_POST_UPVOTE_PERCENT,
});

export const setCommentUpvotePercent = (payload) => ({
  payload,
  type: SET_COMMENT_UPVOTE_PERCENT,
});

export const changeAllNotificationSettings = (payload) => ({
  payload,
  type: CHANGE_ALL_NOTIFICATION_SETTINGS,
});

export const changeNotificationSettings = (payload) => {
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

    case 'notification':
      return {
        payload: payload.action,
        type: IS_NOTIFICATION_OPEN,
      };

    default:
      return null;
  }
};

export const setIsDarkTheme = (payload) => ({
  payload,
  type: IS_DARK_THEME,
});

export const setColorTheme = (payload: number) => ({
  payload,
  type: SET_COLOR_THEME,
});

export const isPinCodeOpen = (payload) => ({
  payload,
  type: IS_PIN_CODE_OPEN,
});

export const setConnectivityStatus = (payload) => ({
  payload,
  type: IS_CONNECTED,
});

export const setNsfw = (payload) => ({
  payload,
  type: SET_NSFW,
});

export const isDefaultFooter = (payload) => ({
  payload,
  type: IS_DEFAULT_FOOTER,
});

/**
 * MW
 */
export const setCurrency = (currency) => async (dispatch) => {
  const currencySymbol = getSymbolFromCurrency(currency);

  const currencyRate = await getCurrencyRate(currency);
  dispatch({
    type: SET_CURRENCY,
    payload: { currency, currencyRate, currencySymbol },
  });
};

export const setPinCode = (data) => ({
  type: SET_PIN_CODE,
  payload: data,
});

export const isRenderRequired = (payload) => ({
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
