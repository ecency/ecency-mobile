import {
  ACTIVE_APPLICATION,
  CLOSE_PIN_CODE_MODAL,
  IS_DARK_THEME,
  IS_LOGIN_DONE,
  IS_NOTIFICATION_OPEN,
  LOGIN,
  LOGOUT,
  OPEN_PIN_CODE_MODAL,
  SET_API,
  SET_CURRENCY,
  SET_LANGUAGE,
  SET_UPVOTE_PERCENT,
  LOGOUT_DONE,
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

export const setCurrency = payload => ({
  payload,
  type: SET_CURRENCY,
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
