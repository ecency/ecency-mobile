import { TOAST_NOTIFICATION, UPDATE_ACTIVE_BOTTOM_TAB } from '../constants/constants';

export const updateActiveBottomTab = payload => ({
  payload,
  type: UPDATE_ACTIVE_BOTTOM_TAB,
});

export const toastNotification = payload => ({
  payload,
  type: TOAST_NOTIFICATION,
});
