import React, { Fragment } from 'react';
import { TouchableHighlight, ActivityIndicator } from 'react-native';
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
    <TouchableHighlight
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
        <ActivityIndicator color="white" style={styles.activityIndicator} />
      )}
    </TouchableHighlight>
  </Fragment>
);

export default IconButton;
