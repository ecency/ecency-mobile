import React, { Component } from 'react';
import { View, Text } from 'react-native';

// Constants

// Components

// Styles
import styles from './containerHeaderStyles';

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
    const { title } = this.props;

    return (
      <View style={styles.wrapper}>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }
}

export default ContainerHeaderView;
