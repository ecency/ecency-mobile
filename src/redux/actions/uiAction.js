import {
  IS_COLLAPSE_POST_BUTTON,
  TOAST_NOTIFICATION,
  UPDATE_ACTIVE_BOTTOM_TAB,
} from '../constants/constants';

export const updateActiveBottomTab = payload => ({
  payload,
  type: UPDATE_ACTIVE_BOTTOM_TAB,
});

export const isCollapsePostButton = payload => ({
  payload,
  type: IS_COLLAPSE_POST_BUTTON,
});

export const toastNotification = payload => ({
  payload,
  type: TOAST_NOTIFICATION,
});
