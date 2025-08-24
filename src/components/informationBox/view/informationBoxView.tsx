import React from 'react';
import { View, Text } from 'react-native';
import styles from './informationBoxStyles';

const InformationBox = ({ text, style, textStyle }) => (
  <View style={[styles.container, style]}>
    <Text style={[styles.text, textStyle]}>{text}</Text>
  </View>
);

export default InformationBox;
