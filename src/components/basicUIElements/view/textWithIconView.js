import React from "react";
import { View, TouchableHighlight, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "./textWithIconStyles";

const TextWithIcon = ({ iconName, text, isClickable, onPress }) => (
  <View style={styles.container}>
    {isClickable || onPress ? (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => onPress && onPress()}
      >
        <View style={styles.wrapper}>
          <Ionicons style={styles.icon} name={iconName} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </TouchableHighlight>
    ) : (
      <View style={styles.wrapper}>
        <Ionicons style={styles.icon} name={iconName} />
        <Text style={styles.text}>{text}</Text>
      </View>
    )}
  </View>
);

export default TextWithIcon;
