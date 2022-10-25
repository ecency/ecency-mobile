import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, { EasingNode } from 'react-native-reanimated';

const styles = StyleSheet.create({
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderRadius: 8,
  },
  container: {
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
  },
});

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

const ProgressiveImage = ({ thumbnailSource, source, style, ...props }) => {
  // const [calcImgHeight, setCalcImgHeight] = useState(300);
  const thumbnailAnimated = new Animated.Value(0);
  const imageAnimated = new Animated.Value(0);

  const handleThumbnailLoad = (e) => {
    /* if (e) {
      setCalcImgHeight(Math.floor((e.nativeEvent.height / e.nativeEvent.width) * dim.width));
      console.log(e.nativeEvent.width, e.nativeEvent.height);
    } */
    Animated.timing(thumbnailAnimated, {
      toValue: 1,
      easing: EasingNode.inOut(EasingNode.ease),
    }).start();
  };

  const onImageLoad = () => {
    Animated.timing(imageAnimated, {
      toValue: 1,
      easing: EasingNode.inOut(EasingNode.ease),
    }).start();
  };

  return (
    <View style={styles.container}>
      <AnimatedFastImage
        {...props}
        source={thumbnailSource}
        style={[style, { opacity: thumbnailAnimated }]}
        onLoad={handleThumbnailLoad}
        blurRadius={1}
        resizeMode={FastImage.resizeMode.cover}
      />
      <AnimatedFastImage
        {...props}
        source={source}
        style={[styles.imageOverlay, { opacity: imageAnimated }, style]}
        onLoad={onImageLoad}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );
};

export default ProgressiveImage;
