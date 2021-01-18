import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import globalStyles from '../../../../globalStyles';

const EmptyScreenView = ({ style, textStyle }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <LottieView
      style={[{ width: 150, height: 150, marginBottom: 12 }, style]}
      source={require('../../../../assets/animations/empty_screen.json')}
      autoPlay
      loop={true}
    />
    <Text style={[globalStyles.title, textStyle]}>Nothing found!</Text>
  </View>
);

export default EmptyScreenView;
