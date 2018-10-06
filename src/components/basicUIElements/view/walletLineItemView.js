import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './walletLineItemStyles';

const WalletLineItem = ({
  text, textColor, iconName, rightText, rightTextColor, isBoldText,
}) => (
  <View style={styles.container}>
    <View style={styles.wrapper}>
      <View stlye={styles.iconTextWrapper}>
        {iconName && <Ionicons style={styles.icon} name={iconName} />}
        <View>
          <Text
            style={[
              styles.text,
              textColor && { color: textColor },
              isBoldText && { fontWeight: 'bold' },
            ]}
          >
            {text}
          </Text>
        </View>
      </View>
      <Text style={[styles.rightText, rightTextColor && { color: rightTextColor }]}>
        {rightText}
      </Text>
    </View>
  </View>
);

export default WalletLineItem;
