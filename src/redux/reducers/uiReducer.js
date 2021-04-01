import {
  UPDATE_ACTIVE_BOTTOM_TAB,
  TOAST_NOTIFICATION,
  HIDE_POSTS_THUMBNAILS,
  RC_OFFER,
  TOGGLE_ACCOUNTS_BOTTOM_SHEET,
  SHOW_ACTION_MODAL,
  HIDE_ACTION_MODAL,
} from '../constants/constants';

const initialState = {
  activeBottomTab: 'HomeTabbar',
  toastNotification: '',
  hidePostsThumbnails: false,
  rcOffer: false,
  isVisibleAccountsBottomSheet: false,
  actionModalVisible: false,
  actionModalData: null,
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
    default:
      return state;
  }
}
