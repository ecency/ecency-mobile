import React from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { Icon } from '../../../icon';
import styles from './textWithIconStyles';

const TextWithIcon = ({
  iconName, text, isClickable, onPress, iconStyle, iconType,
}) => (
  <View style={styles.container}>
    {isClickable || onPress ? (
      <TouchableHighlight underlayColor="transparent" onPress={() => onPress && onPress()}>
        <View style={styles.wrapper}>
          <Icon style={[styles.icon, iconStyle]} name={iconName} iconType={iconType} />
          <Text style={[styles.text]}>{text}</Text>
        </View>
      </TouchableHighlight>
    ) : (
      <View style={styles.wrapper}>
        <Icon style={[styles.icon, iconStyle]} name={iconName} iconType={iconType} />
        <Text style={styles.text}>{text}</Text>
      </View>
    )}
  </View>
);

export default TextWithIcon;
