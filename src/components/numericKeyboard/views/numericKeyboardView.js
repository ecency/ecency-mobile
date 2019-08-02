import React from 'react';
import { View } from 'react-native';
import times from 'lodash/times';
import { CircularButton, IconButton } from '../../buttons';

import styles from './numericKeyboardStyles';

const NumericKeyboard = ({ onPress }) => (
  <View style={styles.container}>
    <View style={styles.buttonGroup}>
      {times(9, i => (
        <CircularButton
          key={i}
          style={styles.button}
          text={i + 1}
          value={i + 1}
          onPress={onPress}
        />
      ))}
    </View>
    <View style={styles.lastButtonGroup}>
      <CircularButton
        style={styles.button}
        text={0}
        value={0}
        onPress={value => onPress && onPress(value)}
      />
      <IconButton
        handleOnPress={() => onPress && onPress('clear')}
        isCircle
        buttonStyle={styles.buttonWithoutBorder}
        style={styles.iconButton}
        name="backspace"
      />
    </View>
  </View>
);

export default NumericKeyboard;
