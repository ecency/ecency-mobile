import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { initialMode as nativeThemeInitialMode } from 'react-native-dark-mode';
import styles from './launchStyles';

const LaunchScreen = () => (
  <View style={nativeThemeInitialMode !== 'dark' ? styles.container : styles.darkContainer}>
    <LottieView source={require('./animation.json')} autoPlay loop={false} />
  </View>
);

export default LaunchScreen;
