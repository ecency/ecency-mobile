import React, { Component } from 'react';

import { getUserData, getAuthStatus } from '../../../realm/realm';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  async componentWillMount() {
    const { navigation } = this.props;
    // getUserData().then((res) => {
    //   if (res) {
    //     alert(...res);
    //   }
    // });
    await getAuthStatus().then((res) => {
      if (res) {
        navigation.navigate(ROUTES.DRAWER.MAIN);
      } else {
        navigation.navigate(ROUTES.SCREENS.LOGIN);
      }
    });
  }

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
