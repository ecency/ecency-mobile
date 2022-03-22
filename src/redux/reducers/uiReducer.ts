import {
  UPDATE_ACTIVE_BOTTOM_TAB,
  TOAST_NOTIFICATION,
  HIDE_POSTS_THUMBNAILS,
  RC_OFFER,
  TOGGLE_ACCOUNTS_BOTTOM_SHEET,
  SHOW_ACTION_MODAL,
  HIDE_ACTION_MODAL,
  SET_AVATAR_CACHE_STAMP,
  SHOW_PROFILE_MODAL,
  HIDE_PROFILE_MODAL,
  TOGGLE_QR_MODAL,
} from '../constants/constants';

interface UiState {
  activeBottomTab:string;
  toastNotification:string;
  hidePostsThumbnails:boolean;
  rcOffer:boolean;
  isVisibleAccountsBottomSheet:boolean;
  actionModalVisible:boolean;
  actionModalData:any;
  avatarCacheStamp:number;
  profileModalUsername:string;
  isVisibleQRModal:boolean;
}

const initialState:UiState = {
  activeBottomTab: 'HomeTabbar',
  toastNotification: '',
  hidePostsThumbnails: false,
  rcOffer: false,
  isVisibleAccountsBottomSheet: false,
  actionModalVisible: false,
  actionModalData: null,
  avatarCacheStamp: 0,
  profileModalUsername: '',
  isVisibleQRModal: false,
};

export default function (state = initialState, action) {
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

    case HIDE_POSTS_THUMBNAILS:
      return {
        ...state,
        hidePostsThumbnails: action.payload,
      };

    case TOGGLE_ACCOUNTS_BOTTOM_SHEET:
      return {
        ...state,
        isVisibleAccountsBottomSheet: action.payload,
      };
    case SET_AVATAR_CACHE_STAMP:
      return {
        ...state,
        avatarCacheStamp: action.payload
      }
    case TOGGLE_QR_MODAL:
      return {
        ...state,
        isVisibleQRModal: action.payload,
      };
    default:
      return state;
  }
}
