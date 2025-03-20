import { proxifyImageSrc } from '@ecency/render-helper';
import React, { useMemo, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Image as ExpoImage } from 'expo-image';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface AutoHeightImageProps {
  contentWidth: number;
  imgUrl: string;
  metadata?: any;
  isAnchored: boolean;
  activeOpacity?: number;
  aspectRatio?: number;
  lockWidth?: boolean;
  onPress?: () => void;
  setAspectRatio?: (ratio: number) => void;
}

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

export const AutoHeightImage = ({
  contentWidth,
  lockWidth,
  imgUrl,
  metadata,
  aspectRatio,
  isAnchored,
  activeOpacity,
  onPress,
  setAspectRatio,
}: AutoHeightImageProps) => {
  // extract iniital height based on provided ratio
  const _initialHeight = useMemo(() => {
    let _height = contentWidth / (aspectRatio || 16 / 9);
    if (metadata && metadata.image && metadata.image_ratios) {
      metadata.image_ratios.forEach((_ratio, index) => {
        const url = metadata.image[index];

        //make sure ratio is of the target image proxified source
        if (url && Number.isFinite(_ratio) && _ratio !== 0) {
          const poxifiedUrl = proxifyImageSrc(
            url,
            undefined,
            undefined,
            Platform.select({
              ios: 'match',
              android: 'webp',
            }),
          );

          if (imgUrl === poxifiedUrl) {
            _height = contentWidth / _ratio;
          }
        }
      });
    }
    return _height;
  }, [imgUrl]);


  const [imgWidth, setImgWidth] = useState(contentWidth);
  const imgHeightAnim = useSharedValue(_initialHeight); // Initial height based on 16:9 ratio
  const imgOpacityAnim = useSharedValue(0); // Initial opacity for fade-in effect
  const bgColorAnim = useSharedValue(EStyleSheet.value('$primaryLightBackground')); // Initial back

  // Function to animate the height change using Reanimated
  const animateHeight = (newHeight: number) => {
    imgHeightAnim.value = withTiming(newHeight, { duration: 300, easing: Easing.out(Easing.circle) }); // Smooth transition over 300ms
    bgColorAnim.value = withTiming('transparent'), { duration: 200 }; // Smooth transition over 300ms
  };

  // Function to animate the fade-in effect
  const animateFadeIn = () => {
    imgOpacityAnim.value = withTiming(1, { duration: 200 }); // Fade in over 500ms
  };

  // NOTE: important to have post image bound set even for images with ratio already provided
  // as this handles the case where width can be lower than contentWidth
  const _setImageBounds = (width:number, height:number) => {
    const newWidth = lockWidth ? contentWidth : Math.round(width < contentWidth ? width : contentWidth);
    const newHeight = Math.round((height / width) * newWidth);

    if(!aspectRatio){
      animateHeight(newHeight); // Animate the height change
    }
   
    setImgWidth(newWidth);

    if(!aspectRatio && setAspectRatio){
      setAspectRatio(newHeight / newWidth);
    }
  };

  // Use Reanimated to bind the animated height value to the style
  const animatedWrapperStyle = useAnimatedStyle(() => ({
    width: imgWidth,
    height: imgHeightAnim.value, // Bind animated height
    backgroundColor: bgColorAnim.value,
    borderRadius:8,
  }));

  const animatedImgStyle = useAnimatedStyle(() => ({
    flex: 1,
    borderRadius:8,
    opacity: imgOpacityAnim.value, // Bind animated opacity
  }));


  const _onLoad = (evt) => {
    _setImageBounds(evt.source.width, evt.source.height);
    animateFadeIn()
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={isAnchored} activeOpacity={activeOpacity || 1}>
      <Animated.View style={animatedWrapperStyle}>
        <AnimatedExpoImage style={animatedImgStyle}
          source={{ uri: imgUrl }}
          contentFit="cover"
          onLoad={_onLoad} />
      </Animated.View>
    </TouchableOpacity>
  );
};
