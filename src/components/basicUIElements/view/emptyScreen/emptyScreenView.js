import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useIntl } from 'react-intl';

import styles from './emptyScreenStyles';
import globalStyles from '../../../../globalStyles';

const EmptyScreenView = ({ style, textStyle, text }) => {
  const intl = useIntl();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <LottieView
        style={[{ width: 150, height: 150, marginBottom: 12 }, style]}
        source={require('../../../../assets/animations/empty_screen.json')}
        autoPlay
        loop={true}
      />
      <Text style={[globalStyles.title, styles.text, textStyle]}>
        {text || intl.formatMessage({ id: 'empty_screen.nothing_here' })}
      </Text>
    </View>
  );
};

export default EmptyScreenView;
