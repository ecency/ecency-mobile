import { default as ROUTES } from './routeNames';

const authMenuItems = [
  {
    name: 'Profile',
    route: ROUTES.TABBAR.PROFILE,
    icon: 'account-outline',
    id: 'profile',
  },
  {
    name: 'Bookmarks',
    route: ROUTES.SCREENS.BOOKMARKS,
    icon: 'star-outline',
    id: 'bookmarks',
  },
  {
    name: 'Drafts',
    route: ROUTES.SCREENS.DRAFTS,
    icon: 'file-document-edit-outline',
    id: 'drafts',
  },
  // {
  //   name: 'Gallery',
  //   route: 'galery',
  //   icon: 'photo-library',
  //   id: 'gallery',
  // },
  {
    name: 'Settings',
    route: ROUTES.SCREENS.SETTINGS,
    icon: 'settings-outline',
    id: 'settings',
  },
  {
    name: 'Logout',
    route: '',
    icon: 'power-standby',
    id: 'logout',
  },
];

const noAuthMenuItems = [
  {
    name: 'Add Account',
    route: ROUTES.SCREENS.LOGIN,
    icon: 'account-plus-outline',
    id: 'add_account',
  },
  {
    name: 'Settings',
    route: ROUTES.SCREENS.SETTINGS,
    icon: 'settings-outline',
    id: 'settings',
  },
];

export default {
  AUTH_MENU_ITEMS: authMenuItems,
  NO_AUTH_MENU_ITEMS: noAuthMenuItems,
};
