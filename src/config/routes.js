import { createStackNavigator } from 'react-navigation';

import { Home, Splash } from '../screens';

export default createStackNavigator({
  SplashScreen: {
    screen: Splash,
    navigationOptions: {
      header: () => null,
    },
  },
  HomeScreen: {
    screen: Home,
    navigationOptions: {
      header: () => null,
    },
  },
});
