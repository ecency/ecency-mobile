import React from 'react';
import { View, Image } from 'react-native';

import LOGO from '../../../assets/launch_screen.png';

const LaunchScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Image
      source={LOGO}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      resizeMode="contain"
    />
  </View>
);

export default LaunchScreen;
