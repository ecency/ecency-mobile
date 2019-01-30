import React, { Fragment } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { Icon } from '../../../icon';
import styles from './textWithIconStyles';

const TextWithIcon = ({
  iconName,
  text,
  isClickable,
  onPress,
  iconStyle,
  iconType,
  iconSize,
  wrapperStyle,
  textStyle,
}) => (
  <View style={styles.container}>
    {isClickable || onPress ? (
      <TouchableHighlight
        style={[styles.wrapper, wrapperStyle]}
        underlayColor="transparent"
        onPress={() => onPress && onPress()}
      >
        <Fragment>
          <Icon
            style={[styles.icon, iconStyle, iconSize && { fontSize: iconSize }]}
            name={iconName}
            iconType={iconType}
          />
          <Text style={[styles.text, textStyle]}>{text}</Text>
        </Fragment>
      </TouchableHighlight>
    ) : (
      <View style={styles.wrapper}>
        <Icon
          style={[styles.icon, iconStyle, iconSize && { fontSize: iconSize }]}
          name={iconName}
          iconType={iconType}
        />
        <Text style={styles.text}>{text}</Text>
      </View>
    )}
  </View>
);

export default TextWithIcon;
