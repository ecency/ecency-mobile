import { default as ROUTES } from './routeNames';

const authMenuItems = [
  {
    name: 'Profile',
    route: ROUTES.TABBAR.PROFILE,
    icon: 'user',
    id: 'profile',
  },
  {
    name: 'Bookmarks',
    route: ROUTES.SCREENS.BOOKMARKS,
    icon: 'star',
    id: 'bookmarks',
  },
  {
    name: 'Drafts',
    route: ROUTES.SCREENS.DRAFTS,
    icon: 'docs',
    id: 'drafts',
  },
  // {
  //   name: 'Gallery',
  //   route: 'galery',
  //   icon: 'photo-library',
  //   id: 'gallery',
  // },
  {
    name: 'Communities',
    route: ROUTES.SCREENS.COMMUNITIES,
    icon: 'settings',
    id: 'communities',
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
