import {
  UPDATE_ACTIVE_BOTTOM_TAB,
  TOAST_NOTIFICATION,
  RC_OFFER,
  SET_AVATAR_CACHE_STAMP,
  SET_DEVICE_ORIENTATION,
  SET_LOCKED_ORIENTATION,
  LOGOUT,
  LOGOUT_DONE,
  HIVE_URI_TO_HANDLE,
} from '../constants/constants';
import { orientations } from '../constants/orientationsConstants';

export interface PostEditorModalData {
  mode: 'wave' | 'comment' | 'post';
  parentPost?: any;
}

interface UiState {
  activeBottomTab: string;
  toastNotification: string;
  rcOffer: boolean;
  avatarCacheStamp: number;
  deviceOrientation: string;
  lockedOrientation: string;
  isLogingOut: boolean;
  deepLinkToHandle: string;
}

const initialState: UiState = {
  activeBottomTab: 'HomeTabbar',
  toastNotification: '',
  rcOffer: false,
  avatarCacheStamp: 0,
  deviceOrientation: orientations.PORTRAIT,
  lockedOrientation: orientations.PORTRAIT,
  isLogingOut: false,
  deepLinkToHandle: '',
};

const uiReducer = (state = initialState, action): UiState => {
  switch (action.type) {
    case UPDATE_ACTIVE_BOTTOM_TAB:
      return {
        ...state,
        activeBottomTab: action.payload,
      };

    case TOAST_NOTIFICATION:
      return {
        ...state,
        toastNotification: action.payload,
      };

    case RC_OFFER:
      return {
        ...state,
        rcOffer: action.payload,
      };

    case SET_AVATAR_CACHE_STAMP:
      return {
        ...state,
        avatarCacheStamp: action.payload,
      };
    case SET_DEVICE_ORIENTATION:
      return {
        ...state,
        deviceOrientation: action.payload,
      };
    case SET_LOCKED_ORIENTATION:
      return {
        ...state,
        lockedOrientation: action.payload,
      };

    case LOGOUT:
      return {
        ...state,
        isLogingOut: true,
      };
    case LOGOUT_DONE:
      return {
        ...state,
        isLogingOut: false,
      };
    case HIVE_URI_TO_HANDLE:
      return {
        ...state,
        deepLinkToHandle: action.payload,
      };

    default:
      return state;
  }
};

export default uiReducer;
