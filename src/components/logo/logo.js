import React from "react";
import { View, Image } from "react-native";

import LOGO from "../../assets/esteem.png";

// Styles
import styles from "../../styles/logo.styles";
import globalStyles from "../../globalStyles";

const Logo = props => (
  <View style={globalStyles.container}>
    <Image
      source={props.source ? props.source : LOGO}
      style={[styles.logo, props.style]}
      resizeMode="contain"
    />
  </View>
);

export default Logo;
