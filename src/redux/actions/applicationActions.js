import getSymbolFromCurrency from 'currency-symbol-map';
import { getCurrencyRate } from '../../providers/esteem/esteem';
import {
  ACTIVE_APPLICATION,
  CHANGE_COMMENT_NOTIFICATION,
  CHANGE_FOLLOW_NOTIFICATION,
  CHANGE_MENTION_NOTIFICATION,
  CHANGE_REBLOG_NOTIFICATION,
  CHANGE_TRANSFERS_NOTIFICATION,
  CHANGE_ALL_NOTIFICATION_SETTINGS,
  CHANGE_VOTE_NOTIFICATION,
  CLOSE_PIN_CODE_MODAL,
  IS_CONNECTED,
  IS_DARK_THEME,
  IS_DEFAULT_FOOTER,
  IS_LOGIN_DONE,
  IS_NOTIFICATION_OPEN,
  LOGIN,
  LOGOUT_DONE,
  LOGOUT,
  OPEN_PIN_CODE_MODAL,
  SET_API,
  SET_CURRENCY,
  SET_LANGUAGE,
  SET_NSFW,
  SET_UPVOTE_PERCENT,
} from '../constants/constants';

export const login = payload => ({
  payload,
  type: LOGIN,
});

export const logout = () => ({
  type: LOGOUT,
});

export const logoutDone = () => ({
  type: LOGOUT_DONE,
});

export const isLoginDone = () => ({
  type: IS_LOGIN_DONE,
});

export const openPinCodeModal = payload => ({
  payload,
  type: OPEN_PIN_CODE_MODAL,
});

export const closePinCodeModal = () => ({
  type: CLOSE_PIN_CODE_MODAL,
});

export const activeApplication = () => ({
  type: ACTIVE_APPLICATION,
});

// Settings actions
export const setLanguage = payload => ({
  payload,
  type: SET_LANGUAGE,
});

export const setApi = payload => ({
  payload,
  type: SET_API,
});

export const setUpvotePercent = payload => ({
  payload,
  type: SET_UPVOTE_PERCENT,
});

export const changeAllNotificationSettings = payload => ({
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
      break;
  }
};

export const isDarkTheme = payload => ({
  payload,
  type: IS_DARK_THEME,
});

export const setConnectivityStatus = payload => ({
  payload,
  type: IS_CONNECTED,
});

export const setNsfw = payload => ({
  payload,
  type: SET_NSFW,
});

export const isDefaultFooter = payload => ({
  payload,
  type: IS_DEFAULT_FOOTER,
});

/**
 * MW
 */
export const setCurrency = currency => (dispatch) => {
  const currencySymbol = getSymbolFromCurrency(currency);

  getCurrencyRate(currency).then(currencyRate => dispatch({
    type: SET_CURRENCY,
    payload: { currency, currencyRate, currencySymbol },
  }));
};
