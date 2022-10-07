import React, { Fragment } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../../icon';

import styles from './iconButtonStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

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
  size,
  style,
  isLoading,
}) => (
  <Fragment>
    <TouchableOpacity
      style={[styles.iconButton, style]}
      onPress={() => !isLoading && onPress && onPress()}
      underlayColor={backgroundColor || 'white'}
      disabled={disabled}
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
          color={color || EStyleSheet.value('$primaryBlack')}
          style={styles.activityIndicator}
        />
      )}
    </TouchableOpacity>
  </Fragment>
);

export default IconButton;
