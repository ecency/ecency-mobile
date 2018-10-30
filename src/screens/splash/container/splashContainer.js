import React, { Component } from 'react';

import { getUserData, getAuthStatus } from '../../../realm/realm';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  componentDidMount = () => {
    this._getUserData();
  };

  _getUserData = () => {
    const { navigation } = this.props;

    getAuthStatus().then((res) => {
      console.log('=========res=========', res);

      getUserData().then((response) => {
        console.log('=========response=========', response);
        // if (response) {
        //   navigation.navigate(ROUTES.SCREENS.PINCODE);
        //   // navigation.navigate(ROUTES.DRAWER.MAIN);
        // } else {
        //   navigation.navigate(ROUTES.SCREENS.LOGIN);
        // }
      });
    });
  };

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
