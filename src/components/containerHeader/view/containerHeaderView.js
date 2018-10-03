import React, { Component } from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Constants

// Components

// Styles
import styles from "./containerHeaderStyles";

class ContainerHeaderView extends Component {
  /* Props
    * ------------------------------------------------ 
    *   @prop { type }    title            - Renderable title for header.
    * 
    */
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      title,
      isBoldTitle,
      color,
      hasSeperator,
      fontSize,
      iconName,
    } = this.props;

    return (
      <View style={[styles.wrapper, hasSeperator && styles.hasTopBorder]}>
        <Text
          style={[
            styles.title,
            isBoldTitle && { fontWeight: "bold" },
            color && { color: color },
            fontSize && { fontSize: fontSize },
          ]}
        >
          {title}
        </Text>
        {iconName && <Ionicons style={styles.icon} name={iconName} />}
      </View>
    );
  }
}

export default ContainerHeaderView;
