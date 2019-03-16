import getSymbolFromCurrency from 'currency-symbol-map';
import { getCurrencyRate } from '../../providers/esteem/esteem';
import {
  ACTIVE_APPLICATION,
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

export const openPinCodeModal = () => ({
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

export const isNotificationOpen = payload => ({
  payload,
  type: IS_NOTIFICATION_OPEN,
});

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
