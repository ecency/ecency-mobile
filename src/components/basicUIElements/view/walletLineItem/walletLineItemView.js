import React from 'react';
import { View, Text } from 'react-native';

import IconComp from '../../../icon';

import styles from './walletLineItemStyles';

const WalletLineItem = ({
  text,
  textColor,
  iconName,
  iconType,
  rightText,
  rightTextColor,
  isBoldText,
  isThin,
  isCircleIcon,
  circleIconColor,
  description,
  fitContent,
}) => (
  <View style={[styles.container, fitContent && styles.fitContent]}>
    <View style={styles.iconTextWrapper}>
      {iconName && (
        <View
          style={[
            styles.iconWrapper,
            isCircleIcon && styles.circleIcon,
            circleIconColor && { backgroundColor: circleIconColor },
          ]}
        >
          <IconComp style={styles.icon} name={iconName} iconType={iconType} />
        </View>
      )}
      <View>
        <Text
          style={[
            styles.text,
            !iconName && styles.onlyText,
            rightText && styles.longText,
            textColor && { color: textColor },
            isBoldText && { fontWeight: 'bold' },
            isThin && styles.thinText,
          ]}
        >
          {text}
        </Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
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
