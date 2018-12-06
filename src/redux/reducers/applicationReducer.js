import {
  ACTIVE_APPLICATION,
  CLOSE_PIN_CODE_MODAL,
  LOGIN,
  LOGOUT,
  OPEN_PIN_CODE_MODAL,
  SET_API,
  SET_CURRENCY,
  SET_LANGUAGE,
  IS_NOTIFICATION_OPEN,
  IS_DARK_THEME,
  IS_LOGIN_DONE,
} from '../constants/constants';

const initialState = {
  isLoggedIn: false, // Has any logged in user.
  loading: false, // It is lock to all screen and shows loading animation.
  isPinCodeReqiure: false,
  isActive: false,
  isNotificationOpen: true,
  language: 'en-US',
  currency: 'usd',
  api: 'api.steemit.com',
  isDarkTheme: false,
  isLoginDone: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: true,
      };
    case IS_LOGIN_DONE:
      return {
        ...state,
        isLoginDone: true,
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
    case SET_API:
      return Object.assign({}, state, {
        api: action.payload,
      });
    case SET_CURRENCY:
      return Object.assign({}, state, {
        currency: action.payload,
      });
    case SET_LANGUAGE:
      return Object.assign({}, state, {
        language: action.payload,
      });
    case IS_NOTIFICATION_OPEN:
      return Object.assign({}, state, {
        isNotificationOpen: action.payload,
      });
    case IS_DARK_THEME:
      return Object.assign({}, state, {
        isDarkTheme: action.payload,
      });
    default:
      return state;
  }
}
