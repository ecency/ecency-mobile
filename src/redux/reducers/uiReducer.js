import { UPDATE_ACTIVE_BOTTOM_TAB, TOAST_NOTIFICATION } from '../constants/constants';

const initialState = {
  activeBottomTab: 'HomeTabbar',
  toastNotification: '',
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
    default:
      return state;
  }
}
