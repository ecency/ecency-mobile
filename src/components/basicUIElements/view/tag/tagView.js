import React, { Fragment } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './tagStyles';

import { Icon } from '../../../icon';

const Tag = ({
  onPress, isPin, value, isPostCardTag, iconName,
}) => (
  <Fragment>
    <TouchableOpacity style={styles.buttonWrapper} onPress={() => onPress && onPress(value)}>
      <View
        style={[styles.textWrapper, isPin && styles.isPin, isPostCardTag && styles.isPostCardTag]}
      >
        <Text style={[styles.text]}>{value}</Text>
        {iconName && <Icon style={styles.icon} iconType="MaterialIcons" name={iconName} />}
      </View>
    </TouchableOpacity>
  </Fragment>
);

export default Tag;
