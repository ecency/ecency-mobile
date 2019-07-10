import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './scaleSliderStyles';

export class Item extends Component {
  render() {
    const { value } = this.props;

    return (
      <View>
        <Text style={[this.checkActive() ? styles.active : styles.inactive]}>{value}</Text>
        <View style={[this.checkActive() ? styles.line : styles.passiveLine]} />
      </View>
    );
  }

  checkActive = () => {
    const { value, first, second } = this.props;

    if (value >= first && value <= second) return true;
    return false;
  };
}
