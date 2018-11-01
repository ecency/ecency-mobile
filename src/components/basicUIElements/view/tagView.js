import React, { Fragment } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './tagStyles';

const Tag = ({ onPress, isPin, value }) => (
  <Fragment>
    <TouchableOpacity onPress={() => onPress && onPress(value)}>
      <View style={[styles.textWrapper, isPin && styles.isPin]}>
        <Text style={[styles.text]}>{value}</Text>
      </View>
    </TouchableOpacity>
  </Fragment>
);

export default Tag;
