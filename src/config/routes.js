import { createStackNavigator } from 'react-navigation';
import { BaseNavigator } from '../navigation';

import { Splash } from '../screens';

export default createStackNavigator({
  SplashScreen: {
    screen: Splash,
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
});
