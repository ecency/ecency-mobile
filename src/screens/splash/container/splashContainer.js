import React, { Component } from 'react';

import { getUserData, getAuthStatus } from '../../../realm/realm';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  componentWillMount() {
    const { navigation } = this.props;
    // getUserData().then((res) => {
    //   if (res) {
    //     alert(...res);
    //   }
    // });
    getAuthStatus().then((res) => {
      if (res) {
        navigation.navigate('Main');
      } else {
        navigation.navigate('Login');
      }
    });
  }

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
