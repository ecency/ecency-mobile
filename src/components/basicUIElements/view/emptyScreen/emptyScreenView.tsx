import React from 'react';
import { View, Text, TextStyle, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { useIntl } from 'react-intl';

import styles from './emptyScreenStyles';
import globalStyles from '../../../../globalStyles';

interface Props {
  style?: ViewStyle;
  textStyle?: TextStyle;
  text?: string;
}

const EmptyScreenView = ({ style, textStyle, text }: Props) => {
  const intl = useIntl();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', ...style }}>
      <LottieView
        style={{ width: 280, height: 150 }}
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
