import {
  TOAST_NOTIFICATION,
  UPDATE_ACTIVE_BOTTOM_TAB,
  RC_OFFER,
  SET_AVATAR_CACHE_STAMP,
  SET_DEVICE_ORIENTATION,
  SET_LOCKED_ORIENTATION,
  LOGOUT,
  LOGOUT_DONE,
  HIVE_URI_TO_HANDLE,
} from '../constants/constants';

export const updateActiveBottomTab = (payload: string) => ({
  payload,
  type: UPDATE_ACTIVE_BOTTOM_TAB,
});

export const toastNotification = (payload: string) => ({
  payload,
  type: TOAST_NOTIFICATION,
});

export const setRcOffer = (payload: boolean) => ({
  payload,
  type: RC_OFFER,
});

export const setAvatarCacheStamp = (payload: number) => ({
  payload,
  type: SET_AVATAR_CACHE_STAMP,
});

export const setDeviceOrientation = (payload: string) => ({
  payload,
  type: SET_DEVICE_ORIENTATION,
});

export const setLockedOrientation = (payload: string) => ({
  payload,
  type: SET_LOCKED_ORIENTATION,
});

export const logout = () => ({
  type: LOGOUT,
});

export const logoutDone = () => ({
  type: LOGOUT_DONE,
});

export const handleDeepLink = (hiveUri: string) => ({
  payload: hiveUri,
  type: HIVE_URI_TO_HANDLE,
});
