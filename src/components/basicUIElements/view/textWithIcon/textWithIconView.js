import React, { useState, useEffect } from 'react';
import { View, TouchableHighlight, Text, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
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
  isLoading,
}) => {
  const [ltext, setLtext] = useState(text);
  useEffect(() => {
    setLtext(text);
  }, [text]);

  const _iconStyle = [styles.icon, iconStyle, iconSize && { fontSize: iconSize }];

  return (
    <View style={styles.container}>
      <TouchableHighlight
        underlayColor="transparent"
        disabled={!isClickable || !onPress}
        onPress={() => onPress && onPress()}
        onLongPress={() => onLongPress && onLongPress()}
      >
        <View style={[styles.wrapper, wrapperStyle]}>
          {isLoading ? (
            <ActivityIndicator style={_iconStyle} color={EStyleSheet.value('$iconColor')} />
          ) : (
            <Icon style={_iconStyle} name={iconName} iconType={iconType} />
          )}
          <Text style={[styles.text, textStyle]}>{ltext}</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default TextWithIcon;
