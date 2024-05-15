import { default as ROUTES } from './routeNames';

const authMenuItems = [
  {
    name: 'Profile',
    route: ROUTES.SCREENS.PROFILE,
    icon: 'user',
    id: 'profile',
  },
  {
    name: 'Bookmarks',
    route: ROUTES.SCREENS.BOOKMARKS,
    icon: 'bookmarks-outline',
    iconType: 'Ionicons',
    id: 'bookmarks',
  },
  {
    name: 'Favorites',
    route: ROUTES.SCREENS.BOOKMARKS,
    icon: 'heart',
    id: 'favorites',
  },
  {
    name: 'Drafts',
    route: ROUTES.SCREENS.DRAFTS,
    icon: 'docs',
    id: 'drafts',
  },
  {
    name: 'Schedules',
    route: ROUTES.SCREENS.DRAFTS,
    icon: 'clock',
    id: 'schedules',
  },
  {
    name: 'Communities',
    route: ROUTES.SCREENS.COMMUNITIES,
    icon: 'people',
    id: 'communities',
  },
  {
    name: 'QR Scan',
    route: '',
    icon: 'qrcode-scan',
    iconType: 'MaterialCommunityIcons',
    id: 'qr',
  },
  {
    name: 'Refer $ Earn',
    route: ROUTES.SCREENS.REFER,
    icon: 'share',
    id: 'refer',
  },
  {
    name: 'Settings',
    route: ROUTES.SCREENS.SETTINGS,
    icon: 'settings',
    id: 'settings',
  },
  {
    name: 'Logout',
    route: '',
    icon: 'power',
    id: 'logout',
  },
];

const noAuthMenuItems = [
  {
    name: 'Add Account',
    route: ROUTES.SCREENS.LOGIN,
    icon: 'user-follow',
    id: 'add_account',
  },
  {
    name: 'Settings',
    route: ROUTES.SCREENS.SETTINGS,
    icon: 'settings',
    id: 'settings',
  },
];

export default {
  AUTH_MENU_ITEMS: authMenuItems,
  NO_AUTH_MENU_ITEMS: noAuthMenuItems,
};
