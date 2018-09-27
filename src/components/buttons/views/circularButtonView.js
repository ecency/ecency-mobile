import React from "react";
import { TouchableOpacity, Text } from "react-native";

import styles from "./circularButtonStyles";

const CircularButtonView = ({ text, onPress, style }) => (
  <TouchableOpacity
    style={[styles.button, style]}
    onPress={() => onPress && onPress()}
  >
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

export default CircularButtonView;
