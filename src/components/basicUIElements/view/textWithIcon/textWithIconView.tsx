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
  accessibilityLabel,
  accessibilityHint,
}: {
  iconName?: string;
  text?: any;
  isClickable?: boolean;
  onPress?: () => void;
  iconStyle?: any;
  iconType?: string;
  iconSize?: number;
  wrapperStyle?: any;
  textStyle?: any;
  onLongPress?: () => void;
  isLoading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) => {
  const [ltext, setLtext] = useState(text);
  useEffect(() => {
    setLtext(text);
  }, [text]);

  const _iconStyle = [styles.icon, iconStyle, iconSize && { fontSize: iconSize }];
  // Interactive only when both clickable and wired to a press handler — mirror the
  // existing `disabled` condition so screen readers expose the right role/state.
  const _interactive = !!(isClickable && onPress);

  return (
    <View style={styles.container}>
      <TouchableHighlight
        underlayColor="transparent"
        disabled={!isClickable || !onPress}
        onPress={() => onPress && onPress()}
        onLongPress={() => onLongPress && onLongPress()}
        accessibilityRole={_interactive ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        // Only advertise state for actual buttons; decorative/display-only instances
        // must not announce as "dimmed" (disabled) on VoiceOver/TalkBack.
        accessibilityState={_interactive ? { disabled: false } : undefined}
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
