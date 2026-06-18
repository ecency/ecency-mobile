import React from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';
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
      {/* Declarative enter/exit gated to iOS: on Android Fabric these worklet-driven
          mount/unmount commits race the live-recycling Waves feed and throw the
          "Unable to find viewState for tag" crash (ECENCY-MOBILE-7). */}
      <Animated.View
        entering={Platform.OS === 'ios' ? BounceIn.delay(1000) : undefined}
        exiting={Platform.OS === 'ios' ? FadeOut : undefined}
      >
        <TouchableOpacity activeOpacity={0.7} style={styles.fabButton} onPress={onPress}>
          <Icon iconType="MaterialCommunityIcons" name={iconName} color="#fff" size={24} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default FabButton;
