import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

import styles from './launchStyles';

const LaunchScreen = () => (
  <View style={styles.container}>
    <LottieView source={require('./animation.json')} autoPlay loop={false} />
  </View>
);

export default LaunchScreen;
