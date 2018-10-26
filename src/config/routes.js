import { DrawerNavigator, SwitchNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';
import { default as ROUTES } from '../constants/routeNames';

// Screens
import {
  Splash, Login, PinCode, SteemConnect, Editor, Profile,
} from '../screens';

// Components
import { SideMenu } from '../components';

const mainNavigation = DrawerNavigator(
  {
    [ROUTES.SCREENS.HOME]: {
      screen: BaseNavigator,
      navigationOptions: {
        header: () => null,
      },
    },
  },
  {
    contentComponent: SideMenu,
  },
);

export default SwitchNavigator({
  [ROUTES.DRAWER.MAIN]: mainNavigation,
  [ROUTES.SCREENS.EDITOR]: { screen: Editor },
  [ROUTES.SCREENS.LOGIN]: { screen: Login },
  [ROUTES.SCREENS.PINCODE]: { screen: PinCode },
  [ROUTES.SCREENS.PROFILE]: { screen: Profile },
  [ROUTES.SCREENS.SPLASH]: { screen: Splash },
  [ROUTES.SCREENS.STEEM_CONNECT]: { screen: SteemConnect },
});
