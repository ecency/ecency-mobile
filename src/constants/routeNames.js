const DRAWER_SUFFIX = 'Drawer';
const MODAL_SUFFIX = 'Modal';
const SCREEN_SUFFIX = 'Screen';
const TABBAR_SUFFIX = 'Tabbar';
const STACK_SUFFIX = 'Stack';

const ROUTES = {
  SCREENS: {
    BOOKMARKS: `Bookmarks${SCREEN_SUFFIX}`,
    BOOST: `Boost${SCREEN_SUFFIX}`,
    DRAFTS: `Drafts${SCREEN_SUFFIX}`,
    EDITOR: `Editor${SCREEN_SUFFIX}`,
    FOLLOWS: `Follows${SCREEN_SUFFIX}`,
    SPIN_GAME: `SpinGame${SCREEN_SUFFIX}`,
    FEED: `Feed${SCREEN_SUFFIX}`,
    LOGIN: `Login${SCREEN_SUFFIX}`,
    PINCODE: `PinCode${SCREEN_SUFFIX}`,
    POST: `Post${SCREEN_SUFFIX}`,
    PROFILE_EDIT: `ProfileEdit${SCREEN_SUFFIX}`,
    PROFILE: `Profile${SCREEN_SUFFIX}`,
    REBLOGS: `Reblogs${SCREEN_SUFFIX}`,
    REDEEM: `Redeem${SCREEN_SUFFIX}`,
    REGISTER: `Register${SCREEN_SUFFIX}`,
    SEARCH_RESULT: `SearchResult${SCREEN_SUFFIX}`,
    TAG_RESULT: `TagResult${SCREEN_SUFFIX}`,
    SETTINGS: `Settings${SCREEN_SUFFIX}`,
    STEEM_CONNECT: `SteemConnect${SCREEN_SUFFIX}`,
    TRANSFER: `Transfer${SCREEN_SUFFIX}`,
    VOTERS: `Voters${SCREEN_SUFFIX}`,
    COMMENTS: `Comments${SCREEN_SUFFIX}`,
    ACCOUNT_BOOST: `AccountBoost${SCREEN_SUFFIX}`,
    COMMUNITY: `Community${SCREEN_SUFFIX}`,
    COMMUNITIES: `Communities${SCREEN_SUFFIX}`,
    WEB_BROWSER: `WebBrowser${SCREEN_SUFFIX}`,
    REFER: `Refer${SCREEN_SUFFIX}`,
    QR: `QR${SCREEN_SUFFIX}`,
    ASSET_DETAILS: `AssetDetails${SCREEN_SUFFIX}`,
    EDIT_HISTORY: `EditHistory${SCREEN_SUFFIX}`,
    WELCOME: `Welcome${SCREEN_SUFFIX}`,
    ACCOUNT_LIST: `AccountList${SCREEN_SUFFIX}`,
    BACKUP_KEYS: `BackupKeys${SCREEN_SUFFIX}`,
    TRADE: `Trade${SCREEN_SUFFIX}`,
  },
  MODALS: {
    ASSETS_SELECT: `AssetsSelect${MODAL_SUFFIX}`,
    ACCOUNT_LIST: `AccountList${MODAL_SUFFIX}`,
    POLL_WIZARD: `PollWizard${MODAL_SUFFIX}`,
  },
  DRAWER: {
    MAIN: `Main${DRAWER_SUFFIX}`,
  },
  TABBAR: {
    FEED: `Feed${TABBAR_SUFFIX}`,
    NOTIFICATION: `Notification${TABBAR_SUFFIX}`,
    WALLET: `Wallet${TABBAR_SUFFIX}`,
    POST_BUTTON: `PostButton${TABBAR_SUFFIX}`,
    WAVES: `Waves${TABBAR_SUFFIX}`,
  },
  STACK: {
    MAIN: `Main${STACK_SUFFIX}`,
  },
};

export default ROUTES;
