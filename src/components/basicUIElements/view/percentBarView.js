import React from "react";
import { View, Dimensions } from "react-native";
import styles from "./percentBarStyles";

const PercentBar = ({ percent, margin, children }) => (
  <View>
    {children}
    <View style={styles.container}>
      <View
        style={[styles.powerBar, { width: calculateWidth(percent, margin) }]}
      />
    </View>
  </View>
);

const calculateWidth = (percent, margin = null) => {
  if (percent) {
    const per = 100 / percent;

    return Dimensions.get("window").width / per - margin;
  }
  return null;
};

export default PercentBar;
