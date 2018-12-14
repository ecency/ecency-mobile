const SCREEN_SUFFIX = 'Screen';
const DRAWER_SUFFIX = 'Drawer';
const TABBAR_SUFFIX = 'Tabbar';
const MODAL_SUFFIX = 'Modal';

export default {
  SCREENS: {
    EDITOR: `Editor${SCREEN_SUFFIX}`,
    FOLLOWS: `Follows${SCREEN_SUFFIX}`,
    HOME: `Home${SCREEN_SUFFIX}`,
    LOGIN: `Login${SCREEN_SUFFIX}`,
    PINCODE: `PinCode${SCREEN_SUFFIX}`,
    POST: `Post${SCREEN_SUFFIX}`,
    PROFILE: `Profile${SCREEN_SUFFIX}`,
    SETTINGS: `Settings${SCREEN_SUFFIX}`,
    STEEM_CONNECT: `SteemConnect${SCREEN_SUFFIX}`,
    VOTERS: `Voters${SCREEN_SUFFIX}`,
  },
  DRAWER: {
    MAIN: `Main${DRAWER_SUFFIX}`,
  },
  TABBAR: {
    HOME: `Home${TABBAR_SUFFIX}`,
    NOTIFICATION: `Notification${TABBAR_SUFFIX}`,
    POSTBUTTON: `PostButton${TABBAR_SUFFIX}`,
    MESSAGES: `Messages${TABBAR_SUFFIX}`,
    PROFILE: `Profile${TABBAR_SUFFIX}`,
  },
  MODAL: {
    LOGOUT: `Logout${MODAL_SUFFIX}`,
  },
};
