import React, { Fragment } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../../icon';

import styles from './iconButtonStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

interface IconButtonProps {
  name?: string;
  iconType?: string;
  color?: string;
  size?: number;
  backgroundColor?: string;
  badgeCount?: number | string;
  badgeStyle?: StyleProp<ViewStyle>;
  badgeTextStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  isLoading?: boolean;
  iconStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  // The button is a fixed 30x30, below the 44pt guideline. Opt in per call site where a
  // mis-tap is costly, rather than changing the hit area of every icon button at once.
  hitSlop?: TouchableOpacityProps['hitSlop'];
  onPress?: (event?: any) => void;
  onLongPress?: (event?: any) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const IconButton = ({
  backgroundColor,
  badgeCount,
  badgeTextStyle,
  badgeStyle,
  color,
  disabled,
  iconStyle,
  iconType,
  name,
  onPress,
  onLongPress,
  size,
  style,
  isLoading,
  accessibilityLabel,
  accessibilityHint,
  hitSlop,
}: IconButtonProps) => (
  <Fragment>
    <TouchableOpacity
      style={[styles.iconButton, style]}
      hitSlop={hitSlop}
      onPress={() => !isLoading && onPress && onPress()}
      disabled={disabled}
      onLongPress={() => !isLoading && onLongPress && onLongPress()}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      // `isLoading` suppresses onPress, so report it as disabled too — otherwise a
      // screen reader announces an enabled button that does nothing while spinning.
      accessibilityState={{ disabled: !!disabled || !!isLoading }}
    >
      {!isLoading ? (
        <Icon
          style={[
            color && { color },
            backgroundColor && { backgroundColor },
            styles.icon,
            iconStyle && iconStyle,
          ]}
          badgeTextStyle={badgeTextStyle}
          name={name}
          badgeStyle={badgeStyle}
          size={size}
          iconType={iconType}
          badgeCount={badgeCount}
        />
      ) : (
        <ActivityIndicator
          color={color || EStyleSheet.value('$primaryBlue')}
          style={styles.activityIndicator}
        />
      )}
    </TouchableOpacity>
  </Fragment>
);

export default IconButton;
