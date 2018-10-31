import {
  LOGIN,
  LOGOUT,
  OPEN_PIN_CODE_MODAL,
  CLOSE_PIN_CODE_MODAL,
  ACTIVE_APPLICATION,
} from '../constants/constants';

const initialState = {
  isLoggedIn: false, // Has any logged in user.
  loading: false, // It is lock to all screen and shows loading animation.
  isPinCodeReqiure: false,
  isActive: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: true,
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
      };
    case OPEN_PIN_CODE_MODAL:
      return {
        ...state,
        isPinCodeReqiure: true,
      };
    case CLOSE_PIN_CODE_MODAL:
      return {
        ...state,
        isPinCodeReqiure: false,
      };
    case ACTIVE_APPLICATION:
      return {
        ...state,
        isActive: true,
      };
    default:
      return state;
  }
}
