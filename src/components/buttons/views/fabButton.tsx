import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { BounceIn, FadeOut } from 'react-native-reanimated';
import Icon from '../../icon';
import styles from './fabButton.styles';

interface FabButtonProps {
  bottomOffset: number;
  onPress: () => void;
  iconName?: string;
}

const FabButton = ({ bottomOffset, onPress, iconName = 'pencil' }: FabButtonProps) => {
  return (
    <View pointerEvents="box-none" style={[styles.fabWrapper, { bottom: bottomOffset }]}>
      <Animated.View entering={BounceIn.delay(1000)} exiting={FadeOut}>
        <TouchableOpacity activeOpacity={0.7} style={styles.fabButton} onPress={onPress}>
          <Icon iconType="MaterialCommunityIcons" name={iconName} color="#fff" size={24} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default FabButton;
