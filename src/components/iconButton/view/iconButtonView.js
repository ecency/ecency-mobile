import React from "react";
import { View, TouchableHighlight } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import styles from "./iconButtonStyles";

/* Props
* ------------------------------------------------
*   @prop { type }    name                - Description....
*/

const IconButton = ({ name, color, size, onPress, backgroundColor, style }) => (
  <View>
    <TouchableHighlight
      style={[styles.iconButton, style && style]}
      onPress={() => onPress && onPress()}
      underlayColor={backgroundColor}
    >
      <Ionicons
        style={[
          styles.icon,
          color && { color: color },
          backgroundColor && { backgroundColor: backgroundColor },
        ]}
        name={name}
        size={size}
      />
    </TouchableHighlight>
  </View>
);

export default IconButton;
