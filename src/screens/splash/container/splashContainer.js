import React, { Component } from 'react';

import { getUserData, getAuthStatus } from '../../../realm/realm';
import { getAccount } from '../../../providers/steem/dsteem';

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
      if (res) {
        getUserData().then((response) => {
          console.log('=========response=========', response);

          if (response.length > 0) {
            // TODO: Set other users
            getAccount(response[response.length - 1].username).then((accountData) => {
              console.log('=========accountData=========', accountData);
            });
          }

          // if (response) {
          //   navigation.navigate(ROUTES.SCREENS.PINCODE);
          //   // navigation.navigate(ROUTES.DRAWER.MAIN);
          // } else {
          //   navigation.navigate(ROUTES.SCREENS.LOGIN);
          // }
        });
      } else {
        navigation.navigate(ROUTES.DRAWER.MAIN);
      }
    });
  };

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
