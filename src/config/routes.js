import { DrawerNavigator, StackNavigator, SwitchNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';

// Screens
import { Splash, Login } from '../screens';

// Components
import { SideMenu } from '../components';

const mainNavigation = DrawerNavigator(
  {
    HomeScreen: {
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
  Splash: { screen: Splash },
  Login: { screen: Login },
  Main: mainNavigation,
});
