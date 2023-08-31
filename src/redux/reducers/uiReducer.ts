import {
  UPDATE_ACTIVE_BOTTOM_TAB,
  TOAST_NOTIFICATION,
  RC_OFFER,
  TOGGLE_ACCOUNTS_BOTTOM_SHEET,
  SHOW_ACTION_MODAL,
  HIDE_ACTION_MODAL,
  SET_AVATAR_CACHE_STAMP,
  SHOW_PROFILE_MODAL,
  HIDE_PROFILE_MODAL,
  TOGGLE_QR_MODAL,
  SET_DEVICE_ORIENTATION,
  SET_LOCKED_ORIENTATION,
  SHOW_REPLY_MODAL,
  HIDE_REPLY_MODAL,
  LOGOUT,
  LOGOUT_DONE,
  SHOW_WEBVIEW_MODAL,
  HIDE_WEBVIEW_MODAL,
} from '../constants/constants';
import { orientations } from '../constants/orientationsConstants';


export interface PostEditorModalData {
  mode:'wave'|'comment'|'post',
  parentPost?:any
}

interface UiState {
  activeBottomTab: string;
  toastNotification: string;
  rcOffer: boolean;
  isVisibleAccountsBottomSheet: boolean;
  actionModalVisible: boolean;
  actionModalData: any;
  avatarCacheStamp: number;
  profileModalUsername: string;
  isVisibleQRModal: boolean;
  webViewModalData: any;
  isVisibleWebViewModal: boolean;
  deviceOrientation: string;
  lockedOrientation: string;
  replyModalVisible: boolean;
  replyModalData?: PostEditorModalData | null;
  isLogingOut: boolean;
}

const initialState: UiState = {
  activeBottomTab: 'HomeTabbar',
  toastNotification: '',
  rcOffer: false,
  isVisibleAccountsBottomSheet: false,
  actionModalVisible: false,
  actionModalData: null,
  avatarCacheStamp: 0,
  profileModalUsername: '',
  isVisibleQRModal: false,
  isVisibleWebViewModal: false,
  webViewModalData: null,
  deviceOrientation: orientations.PORTRAIT,
  lockedOrientation: orientations.PORTRAIT,
  replyModalData: null,
  replyModalVisible: false,
  isLogingOut: false,
};

export default function (state = initialState, action): UiState {
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

    case SHOW_ACTION_MODAL: {
      return {
        ...state,
        actionModalVisible: action.payload.actionModalVisible,
        actionModalData: action.payload.actionModalData,
      };
    }

    case HIDE_ACTION_MODAL: {
      return {
        ...state,
        actionModalVisible: false,
        actionModalData: null,
      };
    }

    case SHOW_PROFILE_MODAL: {
      return {
        ...state,
        profileModalUsername: action.payload.profileModalUsername,
      };
    }

    case HIDE_PROFILE_MODAL: {
      return {
        ...state,
        profileModalUsername: '',
      };
    }

    case RC_OFFER:
      return {
        ...state,
        rcOffer: action.payload,
      };

    case TOGGLE_ACCOUNTS_BOTTOM_SHEET:
      return {
        ...state,
        isVisibleAccountsBottomSheet: action.payload,
      };
    case SET_AVATAR_CACHE_STAMP:
      return {
        ...state,
        avatarCacheStamp: action.payload,
      };
    case TOGGLE_QR_MODAL:
      return {
        ...state,
        isVisibleQRModal: action.payload,
      };
    case SHOW_WEBVIEW_MODAL:
      return {
        ...state,
        isVisibleWebViewModal: action.payload.isVisibleWebViewModal,
        webViewModalData: action.payload.webViewModalData,
      };
    case HIDE_WEBVIEW_MODAL:
      return {
        ...state,
        isVisibleWebViewModal: false,
        webViewModalData: null,
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
    case SHOW_REPLY_MODAL:
      const _payload = action.payload as PostEditorModalData;
      if(_payload.mode === 'comment' && !_payload.parentPost){
        throw new Error("parent post missing for showing post editor modal with comment mode")
      }
      return {
        ...state,
        replyModalVisible: true,
        replyModalData: action.payload,
      };
    case HIDE_REPLY_MODAL:
      return {
        ...state,
        replyModalVisible: false,
        replyModalData: null,
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
    default:
      return state;
  }
}
