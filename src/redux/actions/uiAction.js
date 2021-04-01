import {
  TOAST_NOTIFICATION,
  UPDATE_ACTIVE_BOTTOM_TAB,
  HIDE_POSTS_THUMBNAILS,
  RC_OFFER,
  TOGGLE_ACCOUNTS_BOTTOM_SHEET,
  SHOW_ACTION_MODAL,
  HIDE_ACTION_MODAL,
} from '../constants/constants';

export const updateActiveBottomTab = (payload) => ({
  payload,
  type: UPDATE_ACTIVE_BOTTOM_TAB,
});

export const toastNotification = (payload) => ({
  payload,
  type: TOAST_NOTIFICATION,
});

export const showActionModal = (title, body, buttons, headerImage) => ({
  payload: {
    actionModalVisible: true,
    actionModalData: {
      title,
      body,
      buttons,
      headerImage,
    },
  },
  type: SHOW_ACTION_MODAL,
});

export const hideActionModal = () => ({
  type: HIDE_ACTION_MODAL,
});

export const setRcOffer = (payload) => ({
  payload,
  type: RC_OFFER,
});

export const hidePostsThumbnails = (payload) => ({
  payload,
  type: HIDE_POSTS_THUMBNAILS,
});

export const toggleAccountsBottomSheet = (payload) => ({
  payload,
  type: TOGGLE_ACCOUNTS_BOTTOM_SHEET,
});
