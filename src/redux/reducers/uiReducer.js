import { UPDATE_ACTIVE_BOTTOM_TAB, IS_COLLAPSE_POST_BUTTON } from '../constants/constants';

const initialState = {
  activeBottomTab: 'Home',
  isCollapsePostButton: false,
};

export default function (state = initialState, action) {
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
    default:
      return state;
  }
}
