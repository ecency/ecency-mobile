import { default as ROUTES } from './routeNames';

const authMenuItems = [
  {
    name: 'Profile',
    route: 'Profile',
    icon: 'user-o',
  },
  {
    name: 'Bookmarks',
    route: 'bookmarks',
    icon: 'star-o',
  },
  {
    name: 'Favorites',
    route: 'favorites',
    icon: 'heart-o',
  },
  {
    name: 'Drafts',
    route: 'drafts',
    icon: 'file-o',
  },
  {
    name: 'Schedules',
    route: 'schedules',
    icon: 'clock-o',
  },
  {
    name: 'Gallery',
    route: 'galery',
    icon: 'picture-o',
  },
  {
    name: 'Settings',
    route: 'Settings',
    icon: 'gear',
  },
  {
    name: 'LoginTest',
    route: ROUTES.SCREENS.LOGIN,
    icon: 'user-o',
  },
];

const noAuthMenuItems = [
  {
    name: 'Login',
    route: ROUTES.SCREENS.LOGIN,
    icon: 'user-o',
  },
];

export default {
  AUTH_MENU_ITEMS: authMenuItems,
  NO_AUTH_MENU_ITEMS: noAuthMenuItems,
};
