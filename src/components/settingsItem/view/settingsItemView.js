import React, { Component } from 'react';
import { View, Text } from 'react-native';

// Constants

// Components

// Styles
import styles from './settingsItemStyles';

class SettingsItemView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    // eslint-disable-next-line
    const { title, children } = this.props;

    // eslint-disable-next-line
    return (
      <View style={styles.wrapper}>
        <Text style={styles.text}>{title}</Text>
        {children}
      </View>
    );
  }
}

export default SettingsItemView;
