import React, { Component } from 'react';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  componentWillMount() {
    const { navigation } = this.props;
    navigation.navigate('HomeScreen');
  }

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
