import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';

import styles from './checkboxStyles';

class CheckBoxView extends Component {
  constructor(props) {
    super(props);
    this.state = { isCheck: false };
  }

  _checkClicked = async () => {
    const { clicked, value } = this.props;

    await this.setState(prevState => ({
      isCheck: !prevState.isCheck,
    }));

    const { isCheck } = this.state;

    if (clicked) clicked(value, isCheck);
  };

  render() {
    const { style, isChecked, locked } = this.props;
    const { isCheck } = this.state;

    if (locked) {
      return (
        <View style={styles.bigSquare}>
          <View style={[styles.smallSquare, isChecked && styles.checked]} />
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={this._checkClicked} style={style}>
        <View style={styles.bigSquare}>
          <View style={[styles.smallSquare, isCheck && styles.checked]} />
        </View>
      </TouchableOpacity>
    );
  }
}

export default CheckBoxView;
