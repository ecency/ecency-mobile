import {
  TOAST_NOTIFICATION,
  UPDATE_ACTIVE_BOTTOM_TAB,
  RC_OFFER,
  TOGGLE_ACCOUNTS_BOTTOM_SHEET,
  SHOW_ACTION_MODAL,
  HIDE_ACTION_MODAL,
  SET_AVATAR_CACHE_STAMP,
  SHOW_PROFILE_MODAL,
  HIDE_PROFILE_MODAL,
  TOGGLE_QR_MODAL,
  SET_DEVICE_ORIENTATION,
  SHOW_REPLY_MODAL,
  HIDE_REPLY_MODAL,
  SET_LOCKED_ORIENTATION,
  LOGOUT,
  LOGOUT_DONE,
  SHOW_WEBVIEW_MODAL,
  HIDE_WEBVIEW_MODAL,
} from '../constants/constants';

export const updateActiveBottomTab = (payload: string) => ({
  payload,
  type: UPDATE_ACTIVE_BOTTOM_TAB,
});

export const toastNotification = (payload: string) => ({
  payload,
  type: TOAST_NOTIFICATION,
});

export const showActionModal = (payload: any) => ({
  payload: {
    actionModalVisible: new Date().getTime(),
    actionModalData: {
      ...payload,
    },
  },
  type: SHOW_ACTION_MODAL,
});

export const hideActionModal = () => ({
  type: HIDE_ACTION_MODAL,
});

export const showProfileModal = (username: string) => ({
  payload: {
    profileModalUsername: username,
  },
  type: SHOW_PROFILE_MODAL,
});

export const hideProfileModal = () => ({
  type: HIDE_PROFILE_MODAL,
});

export const setRcOffer = (payload: boolean) => ({
  payload,
  type: RC_OFFER,
});

export const toggleAccountsBottomSheet = (payload: boolean) => ({
  payload,
  type: TOGGLE_ACCOUNTS_BOTTOM_SHEET,
});

export const setAvatarCacheStamp = (payload: number) => ({
  payload,
  type: SET_AVATAR_CACHE_STAMP,
});

export const toggleQRModal = (payload: boolean) => ({
  payload,
  type: TOGGLE_QR_MODAL,
});

export const showWebViewModal = (payload: any) => ({
  payload: {
    isVisibleWebViewModal: new Date().getTime(),
    webViewModalData: {
      ...payload,
    },
  },
  type: SHOW_WEBVIEW_MODAL,
});

export const hideWebViewModal = () => ({
  type: HIDE_WEBVIEW_MODAL,
});

export const setDeviceOrientation = (payload: string) => ({
  payload,
  type: SET_DEVICE_ORIENTATION,
});

export const setLockedOrientation = (payload: string) => ({
  payload,
  type: SET_LOCKED_ORIENTATION,
});

export const showReplyModal = (selectionPost: any) => ({
  payload: selectionPost,
  type: SHOW_REPLY_MODAL,
});

export const hideReplyModal = () => ({
  type: HIDE_REPLY_MODAL,
});

export const logout = () => ({
  type: LOGOUT,
});

export const logoutDone = () => ({
  type: LOGOUT_DONE,
});
