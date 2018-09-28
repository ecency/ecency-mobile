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
          <CircularButton style={styles.button} text={1} />
          <CircularButton style={styles.button} text={2} />
          <CircularButton style={styles.button} text={3} />
        </View>
        <View style={styles.buttonGroup}>
          <CircularButton style={styles.button} text={4} />
          <CircularButton style={styles.button} text={5} />
          <CircularButton style={styles.button} text={6} />
        </View>
        <View style={styles.buttonGroup}>
          <CircularButton style={styles.button} text={7} />
          <CircularButton style={styles.button} text={8} />
          <CircularButton style={styles.button} text={9} />
        </View>
        <CircularButton style={styles.button} text={0} />
      </View>
    );
  }
}

export default NumericKeyboard;
