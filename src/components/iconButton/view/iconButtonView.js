import React, { Fragment } from 'react';
import { TouchableHighlight } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import styles from './iconButtonStyles';

/* Props
* ------------------------------------------------
*   @prop { type }    name                - Description....
*/

const IconButton = ({
  name, color, size, onPress, backgroundColor, style, iconStyle,
}) => (
  <Fragment>
    <TouchableHighlight
      style={[!style && styles.iconButton, style && style]}
      onPress={() => onPress && onPress()}
      underlayColor={backgroundColor || 'white'}
    >
      <Ionicons
        style={[
          color && { color },
          backgroundColor && { backgroundColor },
          styles.icon,
          iconStyle && iconStyle,
        ]}
        name={name}
        size={size}
      />
    </TouchableHighlight>
  </Fragment>
);

export default IconButton;
