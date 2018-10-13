import { DrawerNavigator, SwitchNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';
import { default as ROUTES } from '../constants/routeNames';

// Screens
import {
  Editor, Login, PinCode, Splash,
} from '../screens';

// Components
import { SideMenu } from '../components';

const mainNavigation = DrawerNavigator(
  {
    [ROUTES.SCREENS.HOME]: {
      screen: Editor,
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
  [ROUTES.SCREENS.SPLASH]: { screen: Splash },
});
