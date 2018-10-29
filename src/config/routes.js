import { DrawerNavigator, SwitchNavigator, createStackNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';
import { default as ROUTES } from '../constants/routeNames';

// Screens
import {
  Splash, Login, PinCode, SteemConnect, Editor, Profile, Post,
} from '../screens';

// Components
import { SideMenu } from '../components';

const mainNavigation = DrawerNavigator(
  {
    [ROUTES.SCREENS.HOME]: {
      screen: BaseNavigator,
    },
  },
  {
    contentComponent: SideMenu,
  },
);

const stackNavigatior = createStackNavigator(
  {
    [ROUTES.DRAWER.MAIN]: {
      screen: mainNavigation,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.PROFILE]: {
      screen: Profile,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.POST]: {
      screen: Post,
      navigationOptions: {
        header: () => null,
      },
    },
    [ROUTES.SCREENS.EDITOR]: {
      screen: Editor,
      navigationOptions: {
        header: () => null,
      },
    },
  },
  {
    cardStyle: {
      backgroundColor: 'white',
    },
  },
);

export default SwitchNavigator({
  stackNavigatior,
  [ROUTES.SCREENS.LOGIN]: { screen: Login },
  [ROUTES.SCREENS.PINCODE]: { screen: PinCode },
  [ROUTES.SCREENS.SPLASH]: { screen: Splash },
  [ROUTES.SCREENS.STEEM_CONNECT]: { screen: SteemConnect },
});
