import {
  ACTIVE_APPLICATION,
  CHANGE_COMMENT_NOTIFICATION,
  CHANGE_FOLLOW_NOTIFICATION,
  CHANGE_MENTION_NOTIFICATION,
  CHANGE_REBLOG_NOTIFICATION,
  CHANGE_TRANSFERS_NOTIFICATION,
  CHANGE_VOTE_NOTIFICATION,
  CHANGE_ALL_NOTIFICATION_SETTINGS,
  CLOSE_PIN_CODE_MODAL,
  IS_CONNECTED,
  IS_DARK_THEME,
  IS_DEFAULT_FOOTER,
  IS_LOGIN_DONE,
  IS_NOTIFICATION_OPEN,
  LOGIN,
  LOGOUT_DONE,
  LOGOUT,
  OPEN_PIN_CODE_MODAL,
  SET_API,
  SET_CURRENCY,
  SET_LANGUAGE,
  SET_NSFW,
  SET_UPVOTE_PERCENT,
} from '../constants/constants';

const initialState = {
  api: 'api.steemit.com',
  currency: {
    currency: 'usd',
    currecyRate: 1,
    currencySymbol: '$',
  },
  isActive: false,
  isConnected: true, // internet connectivity
  isDarkTheme: false,
  isDefaultFooter: true,
  isLoggedIn: false, // Has any logged in user.
  isLoginDone: false,
  isLogingOut: false,
  isNotificationOpen: true,
  isPinCodeReqiure: false,
  pinCodeNavigation: {},
  language: 'en-US',
  loading: false, // It is lock to all screen and shows loading animation.
  notificationDetails: {
    commentNotification: true,
    followNotification: true,
    mentionNotification: true,
    reblogNotification: true,
    transfersNotification: true,
    voteNotification: true,
  },
  upvotePercent: 1,
  nsfw: 'Always show',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: action.payload,
      };
    case IS_LOGIN_DONE:
      return {
        ...state,
        isLoginDone: true,
      };
    case IS_CONNECTED:
      return {
        ...state,
        isConnected: action.payload,
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
    case OPEN_PIN_CODE_MODAL:
      return {
        ...state,
        isPinCodeReqiure: true,
        pinCodeNavigation: action.payload || {},
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
    case CHANGE_COMMENT_NOTIFICATION:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          commentNotification: action.payload,
        },
      });
    case CHANGE_FOLLOW_NOTIFICATION:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          followNotification: action.payload,
        },
      });
    case CHANGE_MENTION_NOTIFICATION:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          mentionNotification: action.payload,
        },
      });
    case CHANGE_REBLOG_NOTIFICATION:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          reblogNotification: action.payload,
        },
      });
    case CHANGE_TRANSFERS_NOTIFICATION:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          transfersNotification: action.payload,
        },
      });
    case CHANGE_VOTE_NOTIFICATION:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          voteNotification: action.payload,
        },
      });

    case CHANGE_ALL_NOTIFICATION_SETTINGS:
      return Object.assign({}, state, {
        notificationDetails: {
          ...state.notificationDetails,
          mentionNotification: action.payload.mentionNotification,
          reblogNotification: action.payload.reblogNotification,
          transfersNotification: action.payload.transfersNotification,
          voteNotification: action.payload.voteNotification,
          followNotification: action.payload.followNotification,
          commentNotification: action.payload.commentNotification,
        },
      });
    case IS_DARK_THEME:
      return Object.assign({}, state, {
        isDarkTheme: action.payload,
      });
    case SET_UPVOTE_PERCENT:
      return Object.assign({}, state, {
        upvotePercent: action.payload,
      });
    case SET_NSFW:
      return Object.assign({}, state, {
        nsfw: action.payload,
      });
    case IS_DEFAULT_FOOTER:
      return Object.assign({}, state, {
        isDefaultFooter: action.payload,
      });
    default:
      return state;
  }
}
