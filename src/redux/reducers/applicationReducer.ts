import {
  CHANGE_COMMENT_NOTIFICATION,
  CHANGE_FOLLOW_NOTIFICATION,
  CHANGE_MENTION_NOTIFICATION,
  CHANGE_REBLOG_NOTIFICATION,
  CHANGE_TRANSFERS_NOTIFICATION,
  CHANGE_VOTE_NOTIFICATION,
  CHANGE_ALL_NOTIFICATION_SETTINGS,
  CLOSE_PIN_CODE_MODAL,
  IS_CONNECTED,
  IS_ANALYTICS,
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
  SET_PIN_CODE,
  IS_PIN_CODE_OPEN,
  IS_RENDER_REQUIRED,
  SET_LAST_APP_VERSION,
  SET_COLOR_THEME,
  SET_SETTINGS_MIGRATED,
  HIDE_POSTS_THUMBNAILS,
  SET_TERMS_ACCEPTED,
} from '../constants/constants';

interface State {
  api: string;
  currency: {
    currency: string,
    currencyRate: number,
    currencySymbol: string,
  },
  isConnected: boolean|null, // internet connectivity
  isDarkTheme: boolean;
  colorTheme: number;
  isDefaultFooter: boolean; //TODO: remove present of isDefaultFooter as it's no longer in use
  isLoggedIn: boolean; // Has any logged in user.
  isAnalytics: boolean;
  isLoginDone: boolean;
  isLogingOut: boolean;
  isNotificationOpen: boolean;
  isPinCodeRequire: boolean;
  pinCodeNavigation: any,
  language: string,
  loading: boolean; // It is lock to all screen and shows loading animation.
  notificationDetails: {
    commentNotification: boolean,
    followNotification: boolean,
    mentionNotification: boolean,
    reblogNotification: boolean,
    transfersNotification: boolean,
    voteNotification: boolean,
  },
  upvotePercent: number;
  nsfw: string;
  pin: string|null;
  isPinCodeOpen: boolean;
  isRenderRequired: boolean;
  lastAppVersion:string;
  settingsMigratedV2: boolean;
  hidePostsThumbnails: boolean;
  isTermsAccepted: boolean;
}

const initialState:State = {
  api: 'rpc.ecency.com',
  currency: {
    currency: 'usd',
    currencyRate: 1,
    currencySymbol: '$',
  },
  isConnected: null, // internet connectivity
  isDarkTheme: false,
  colorTheme: 0, //values mapped from => src/constants/options/theme.ts
  isDefaultFooter: true, //TODO: remove present of isDefaultFooter as it's no longer in use
  isLoggedIn: false, // Has any logged in user.
  isAnalytics: false,
  isLoginDone: false,
  isLogingOut: false,
  isNotificationOpen: true,
  isPinCodeRequire: false,
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
  nsfw: '1',
  pin: null,
  isPinCodeOpen: false,
  isRenderRequired: false,
  lastAppVersion:'',
  settingsMigratedV2: false,
  hidePostsThumbnails: false,
  isTermsAccepted: false,
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
    case IS_ANALYTICS:
      return {
        ...state,
        isAnalytics: action.payload,
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
        isPinCodeRequire: true,
        pinCodeNavigation: action.payload || {},
      };
    case CLOSE_PIN_CODE_MODAL:
      return {
        ...state,
        isPinCodeRequire: false,
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
    case SET_COLOR_THEME:
      return {
        ...state,
        colorTheme:action.payload
      };
    case IS_PIN_CODE_OPEN:
      return Object.assign({}, state, {
        isPinCodeOpen: action.payload,
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
    case SET_PIN_CODE:
      return {
        ...state,
        pin: action.payload,
      };
    case IS_RENDER_REQUIRED:
      return Object.assign({}, state, {
        isRenderRequired: action.payload,
      });
    
    case SET_LAST_APP_VERSION:
      return {
        ...state,
        lastAppVersion:action.payload
      }

    case SET_SETTINGS_MIGRATED:
      return {
        ...state,
        settingsMigratedV2:action.payload
      }

    case HIDE_POSTS_THUMBNAILS:
      return {
        ...state,
        hidePostsThumbnails:action.payload
      }
    
    case SET_TERMS_ACCEPTED:
      return {
        ...state,
        isTermsAccepted:action.payload
      }

    default:
      return state;
  }
}
