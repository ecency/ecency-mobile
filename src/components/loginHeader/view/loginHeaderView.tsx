import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
// Constants

// Components
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineBreak } from '../../basicUIElements';
// Styles
import styles from './loginHeaderStyles';
import { IconButton } from '../..';

const LoginHeaderView = ({ description, isKeyboardOpen, title, onBackPress }) => {
  // Shared value to track animation progress
  const progress = useSharedValue(isKeyboardOpen ? 0 : 1);

  // Update progress when visibility changes
  useEffect(() => {
    progress.value = withTiming(isKeyboardOpen ? 0 : 1, { duration: 300, easing: Easing.ease });
  }, [isKeyboardOpen]);

  // Create animated styles
  const animatedStyles = useAnimatedStyle(() => {
    const height = interpolate(progress.value, [0, 1], [0, bodyHeight]);

    return {
      height,
      opacity: progress.value,
      overflow: 'hidden',
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View styles={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.backIconContainer}>
            <IconButton
              iconStyle={styles.backIcon}
              iconType="MaterialIcons"
              name="close"
              onPress={onBackPress}
            />
          </View>
        </View>

        <Animated.View style={animatedStyles}>
          <View style={styles.body}>
            <View style={styles.titleText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <View style={styles.mascotContainer}>
              <Image
                resizeMode="contain"
                style={styles.mascot}
                source={require('../../../assets/ecency_logo_transparent.png')}
              />
            </View>
          </View>
        </Animated.View>
        <LineBreak />
      </View>
    </SafeAreaView>
  );
};

export default LoginHeaderView;

const bodyHeight = 120;
