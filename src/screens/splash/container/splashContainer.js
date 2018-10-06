import React, { Component } from 'react';

import { getUserData } from '../../../realm/realm';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  componentWillMount() {
    const { navigation } = this.props;
    // getUserData().then((res) => {
    //   if (res) {
    //     alert(res);
    //   }
    // });
    navigation.navigate('Main');
  }

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
