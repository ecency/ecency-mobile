import React, { Fragment, Component } from "react";
import { View } from "react-native";

import { CircularButton } from "../../";

import styles from "./numericKeyboardStyles";

class NumericKeyboard extends Component {
  /* Props
    * ------------------------------------------------ TODO: Fill fallowlines
    *   @prop { type }    name            - Description.
    *   @prop { type }    name            - Description.
    * 
    */
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonGroup}>
          <CircularButton text={1} />
          <CircularButton
            style={{ marginLeft: 15, marginRight: 15 }}
            text={2}
          />
          <CircularButton text={3} />
        </View>
        <View style={styles.buttonGroup}>
          <CircularButton text={4} />
          <CircularButton
            style={{ marginLeft: 15, marginRight: 15 }}
            text={5}
          />
          <CircularButton text={6} />
        </View>
        <View style={styles.buttonGroup}>
          <CircularButton text={7} />
          <CircularButton
            style={{ marginLeft: 15, marginRight: 15 }}
            text={8}
          />
          <CircularButton text={9} />
        </View>
        <CircularButton text={0} />
      </View>
    );
  }
}

export default NumericKeyboard;
