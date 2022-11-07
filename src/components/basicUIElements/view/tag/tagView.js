import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './tagStyles';
import { Icon } from '../../../icon';

const Tag = ({
  onPress,
  isPin,
  value,
  label,
  isPostCardTag,
  isFilter,
  style,
  textStyle,
  disabled,
  prefix,
  suffix,
  removeEnabled,
}) => (
  <TouchableOpacity
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    onPress={() => onPress && onPress(value)}
    disabled={disabled}
  >
    <View
      style={[
        styles.textWrapper,
        isFilter && styles.isFilter,
        isPin && styles.isPin,
        isPostCardTag && styles.isPostCardTag,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          !isPin && isFilter && styles.isFilterTextUnPin,
          isPin && isFilter && styles.isFilterTextPin,
          textStyle,
        ]}
      >
        {`${prefix || ''} ${label}${suffix || ''}`}
      </Text>
      {removeEnabled && (
        <Icon
          name="close"
          iconType="MaterialCommunityIcons"
          color={EStyleSheet.value('$primaryDarkText')}
          size={12}
          style={{ paddingLeft: 6 }}
        />
      )}
    </View>
  </TouchableOpacity>
);

export default Tag;
