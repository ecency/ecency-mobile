import React from 'react';
import { View, Image } from 'react-native';

import LOGO from '../../assets/ecency_logo_transparent.png';

// Styles
import styles from './logoStyles';
import globalStyles from '../../globalStyles';

const Logo = (props) => (
  <View style={globalStyles.container}>
    <Image
      source={props.source ? props.source : LOGO}
      style={[styles.logo, props.style]}
      resizeMode="contain"
    />
  </View>
);

export default Logo;
