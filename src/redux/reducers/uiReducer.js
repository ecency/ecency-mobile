import { UPDATE_ACTIVE_BOTTOM_TAB } from '../constants/constants';

const initialState = {
  activeBottomTab: 'Home',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_ACTIVE_BOTTOM_TAB:
      return {
        ...state,
        activeBottomTab: action.payload,
      };
    default:
      return state;
  }
}
