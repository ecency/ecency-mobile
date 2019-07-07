import React from 'react';
import { View } from 'react-native';
import { Logo } from '../../../components';

const LaunchScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 80,
    }}
  >
    <Logo style={{ width: 105, height: 110 }} />
  </View>
);

export default LaunchScreen;
