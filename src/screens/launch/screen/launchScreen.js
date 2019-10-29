import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const LaunchScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <LottieView source={require('./animation.json')} autoPlay loop />
  </View>
);

export default LaunchScreen;
