import React, { Fragment } from 'react';
import { TouchableHighlight } from 'react-native';
import { Icon } from '../../icon';

import styles from './iconButtonStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

const IconButton = ({
  name,
  color,
  size,
  onPress,
  backgroundColor,
  style,
  iconStyle,
  iconType,
  disabled,
}) => (
  <Fragment>
    <TouchableHighlight
      style={[styles.iconButton, style]}
      onPress={() => onPress && onPress()}
      underlayColor={backgroundColor || 'white'}
      disabled={disabled}
    >
      <Icon
        style={[
          color && { color },
          backgroundColor && { backgroundColor },
          styles.icon,
          iconStyle && iconStyle,
        ]}
        name={name}
        size={size}
        iconType={iconType}
      />
    </TouchableHighlight>
  </Fragment>
);

export default IconButton;
