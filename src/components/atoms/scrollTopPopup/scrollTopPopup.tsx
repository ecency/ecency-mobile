import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { IconButton } from '../..';
import styles from './scrollTopPopup.styles';

interface ScrollTopPopupProps {
  onPress: () => void;
  enable: boolean;
}

export const ScrollTopPopup = ({
  onPress,
  enable,
}: ScrollTopPopupProps) => {
  if (!enable) {
    return null
  }

  return (
    <Animated.View style={styles.popupContainer} entering={SlideInRight} exiting={SlideOutRight}>
      <View style={styles.popupContentContainer}>
        <TouchableOpacity onPress={onPress}>
          <View style={styles.popupContentContainer}>
            <IconButton
              iconStyle={styles.arrowUpIcon}
              iconType="MaterialCommunityIcons"
              name="arrow-up"
              onPress={onPress}
              size={16}
            />

          </View>
        </TouchableOpacity>

      </View>
    </Animated.View>
  );
};

