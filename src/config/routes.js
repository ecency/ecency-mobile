import { DrawerNavigator, SwitchNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';
import { default as ROUTES } from '../constants/routeNames';

// Screens
import {
  Splash, Login, PinCode, SteemConnect, Editor, Profile, RootComponent,
} from '../screens';

// Components
import { SideMenu } from '../components';

const mainNavigation = DrawerNavigator(
  {
    [ROUTES.SCREENS.HOME]: {
      screen: RootComponent()(BaseNavigator),
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
  [ROUTES.DRAWER.MAIN]: RootComponent()(mainNavigation),
  [ROUTES.SCREENS.EDITOR]: { screen: RootComponent()(Editor) },
  [ROUTES.SCREENS.LOGIN]: { screen: RootComponent()(Login) },
  [ROUTES.SCREENS.PINCODE]: { screen: RootComponent()(PinCode) },
  [ROUTES.SCREENS.PROFILE]: { screen: RootComponent()(Profile) },
  [ROUTES.SCREENS.SPLASH]: { screen: RootComponent()(Splash) },
  [ROUTES.SCREENS.STEEM_CONNECT]: { screen: RootComponent()(SteemConnect) },
});
