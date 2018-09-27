import React, { Fragment } from "react";
import { TouchableWithoutFeedback, Text } from "react-native";

import styles from "./greetingHeaderButtonStyles";

const GreetingHeaderButtonView = ({ text, onPress, style }) => (
  <Fragment>
    <TouchableWithoutFeedback
      style={[styles.button, style]}
      onPress={() => onPress && onPress()}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableWithoutFeedback>
  </Fragment>
);

export default GreetingHeaderButtonView;
