import { default as ROUTES } from './routeNames';

const authMenuItems = [
  {
    name: 'Profile',
    route: 'ProfileTabbar',
    icon: 'perm-identity',
    id: 'profile',
  },
  {
    name: 'Bookmarks',
    route: 'bookmarks',
    icon: 'star-border',
    id: 'bookmarks',
  },
  {
    name: 'Favorites',
    route: 'favorites',
    icon: 'favorite-border',
    id: 'favorites',
  },
  {
    name: 'Drafts',
    route: 'drafts',
    icon: 'insert-drive-file',
    id: 'drafts',
  },
  {
    name: 'Schedules',
    route: 'schedules',
    icon: 'schedule',
    id: 'schedules',
  },
  {
    name: 'Gallery',
    route: 'galery',
    icon: 'photo-library',
    id: 'gallery',
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
    icon: 'exit-to-app',
    id: 'logout',
  },
];

const noAuthMenuItems = [
  {
    name: 'Add Account',
    route: ROUTES.SCREENS.LOGIN,
    icon: 'add',
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
