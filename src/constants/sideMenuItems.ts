import ROUTES from './routeNames';

// 'main' = core navigation, 'footer' = utility/admin entries pushed below a divider
type MenuGroup = 'main' | 'footer';

interface MenuItem {
  name: string;
  route: string;
  icon: string;
  id: string;
  iconType?: string;
  group: MenuGroup;
}

const authMenuItems: MenuItem[] = [
  {
    name: 'Profile',
    route: ROUTES.SCREENS.PROFILE,
    icon: 'user',
    id: 'profile',
    group: 'main',
  },
  {
    name: 'Bookmarks',
    route: ROUTES.SCREENS.BOOKMARKS,
    icon: 'bookmarks-outline',
    iconType: 'Ionicons',
    id: 'bookmarks',
    group: 'main',
  },
  {
    name: 'Drafts',
    route: ROUTES.SCREENS.DRAFTS,
    icon: 'docs',
    id: 'drafts',
    group: 'main',
  },
  {
    name: 'Communities',
    route: ROUTES.SCREENS.COMMUNITIES,
    icon: 'people',
    id: 'communities',
    group: 'main',
  },
  {
    name: 'Explore',
    route: ROUTES.SCREENS.DAPP_BROWSER,
    icon: 'compass-outline',
    iconType: 'MaterialCommunityIcons',
    id: 'explore',
    group: 'main',
  },
  {
    name: 'QR Scan',
    route: '',
    icon: 'qrcode-scan',
    iconType: 'MaterialCommunityIcons',
    id: 'qr',
    group: 'footer',
  },
  {
    name: 'Refer $ Earn',
    route: ROUTES.SCREENS.REFER,
    icon: 'share',
    id: 'refer',
    group: 'footer',
  },
  {
    name: 'Docs',
    route: '',
    icon: 'help-circle',
    iconType: 'Feather',
    id: 'docs',
    group: 'footer',
  },
  {
    name: 'Settings',
    route: ROUTES.SCREENS.SETTINGS,
    icon: 'settings',
    id: 'settings',
    group: 'footer',
  },
  {
    name: 'Logout',
    route: '',
    icon: 'power',
    id: 'logout',
    group: 'footer',
  },
];

const noAuthMenuItems: MenuItem[] = [
  {
    name: 'Add Account',
    route: ROUTES.SCREENS.LOGIN,
    icon: 'user-follow',
    id: 'add_account',
    group: 'main',
  },
  {
    name: 'QR Scan',
    route: '',
    icon: 'qrcode-scan',
    iconType: 'MaterialCommunityIcons',
    id: 'qr',
    group: 'footer',
  },
  {
    name: 'Docs',
    route: '',
    icon: 'help-circle',
    iconType: 'Feather',
    id: 'docs',
    group: 'footer',
  },
  {
    name: 'Settings',
    route: ROUTES.SCREENS.SETTINGS,
    icon: 'settings',
    id: 'settings',
    group: 'footer',
  },
];

export default {
  AUTH_MENU_ITEMS: authMenuItems,
  NO_AUTH_MENU_ITEMS: noAuthMenuItems,
};
