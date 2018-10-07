import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './walletLineItemStyles';

const WalletLineItem = ({
  text,
  textColor,
  iconName,
  rightText,
  rightTextColor,
  isBoldText,
  isThin,
  isCircleIcon,
  circleIconColor,
}) => (
  <View style={styles.container}>
    <View style={styles.iconTextWrapper}>
      {iconName && (
        <View
          style={[
            isCircleIcon && styles.circleIcon,
            circleIconColor && { backgroundColor: circleIconColor },
          ]}
        >
          <Ionicons style={styles.icon} name={iconName} />
        </View>
      )}
      <Text
        style={[
          styles.text,
          textColor && { color: textColor },
          isBoldText && { fontWeight: 'bold' },
          isThin && styles.thinText,
        ]}
      >
        {text}
      </Text>
    </View>
    <View style={styles.rightTextWrapper}>
      <Text
        style={[
          styles.rightText,
          rightTextColor ? { color: rightTextColor } : !text && styles.onlyRightText,
        ]}
      >
        {rightText}
      </Text>
    </View>
  </View>
);

export default WalletLineItem;
