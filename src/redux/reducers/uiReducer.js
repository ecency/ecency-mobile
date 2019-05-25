import {
  UPDATE_ACTIVE_BOTTOM_TAB,
  IS_COLLAPSE_POST_BUTTON,
  TOAST_NOTIFICATION,
} from '../constants/constants';

const initialState = {
  activeBottomTab: 'HomeTabbar',
  isCollapsePostButton: false,
  toastNotifcaion: '',
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_ACTIVE_BOTTOM_TAB:
      return {
        ...state,
        activeBottomTab: action.payload,
      };

    case IS_COLLAPSE_POST_BUTTON:
      return {
        ...state,
        isCollapsePostButton: action.payload,
      };

    case TOAST_NOTIFICATION:
      return {
        ...state,
        toastNotification: action.payload,
      };
    default:
      return state;
  }
}
