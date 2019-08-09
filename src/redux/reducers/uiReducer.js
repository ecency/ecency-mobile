import {
  UPDATE_ACTIVE_BOTTOM_TAB,
  TOAST_NOTIFICATION,
  HIDE_POSTS_THUMBNAILS,
} from '../constants/constants';

const initialState = {
  activeBottomTab: 'HomeTabbar',
  toastNotification: '',
  hidePostsThumbnails: false,
};

export default function(state = initialState, action) {
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

    case HIDE_POSTS_THUMBNAILS:
      return {
        ...state,
        hidePostsThumbnails: action.payload,
      };

    default:
      return state;
  }
}
