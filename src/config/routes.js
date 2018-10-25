import { DrawerNavigator, SwitchNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';
import { default as ROUTES } from '../constants/routeNames';

// Screens
import {
  Login, PinCode, Profile, Splash,
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
  [ROUTES.SCREENS.LOGIN]: { screen: Login },
  [ROUTES.SCREENS.PINCODE]: { screen: PinCode },
  [ROUTES.SCREENS.PROFILE]: { screen: Profile },
  [ROUTES.SCREENS.SPLASH]: { screen: Splash },
});
