import { DrawerNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';

// Screens
import { Splash, Login } from '../screens';

// Components
import { SideMenu } from '../components';

export default DrawerNavigator(
  {
    LoginScreen: {
      screen: Login,
      navigationOptions: {
        header: () => null,
      },
    },
    HomeScreen: {
      screen: BaseNavigator,
      navigationOptions: {
        header: () => null,
        gesturesEnabled: false,
      },
    },
  },
  {
    contentComponent: SideMenu,
  },
);
