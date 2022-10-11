import React, { Fragment, useState, useEffect } from 'react';
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
  onLongPress,
}) => {
  const [ltext, setLtext] = useState(text);
  useEffect(() => {
    setLtext(text);
  }, [text]);
  return (
    <View style={styles.container}>
      <TouchableHighlight
        style={[styles.wrapper, wrapperStyle]}
        underlayColor="transparent"
        disabled={!isClickable || !onPress}
        onPress={() => onPress && onPress()}
        onLongPress={() => onLongPress && onLongPress()}
      >
        <Fragment>
          <Icon
            style={[styles.icon, iconStyle, iconSize && { fontSize: iconSize }]}
            name={iconName}
            iconType={iconType}
          />
          <Text style={[styles.text, textStyle]}>{ltext}</Text>
        </Fragment>
      </TouchableHighlight>
    </View>
  );
};

export default TextWithIcon;
