import { proxifyImageSrc } from '@ecency/render-helper';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';

interface AutoHeightImageProps {
  contentWidth: number;
  imgUrl: string;
  metadata: any;
  isAnchored: boolean;
  activeOpacity?: number;
  onPress: () => void;
}

export const AutoHeightImage = ({
  contentWidth,
  imgUrl,
  metadata,
  isAnchored,
  activeOpacity,
  onPress,
}: AutoHeightImageProps) => {
  // extract iniital height based on provided ratio
  const _initialHeight = useMemo(() => {
    let _height = contentWidth / (16 / 9);
    if (metadata && metadata.image && metadata.image_ratios) {
      metadata.image_ratios.forEach((_ratio, index) => {
        const url = metadata.image[index];

        if (url && !Number.isNaN(_ratio)) {
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
            const _ratio = metadata.image_ratios[index];
            _height = contentWidth / _ratio;
          }
        }
      });
    }
    return _height;
  }, [imgUrl]);

  const [imgWidth, setImgWidth] = useState(contentWidth);
  const [imgHeight, setImgHeight] = useState(_initialHeight);
  const [onLoadCalled, setOnLoadCalled] = useState(false);

  // NOTE: important to have post image bound set even for images with ratio already provided
  // as this handles the case where width can be lower than contentWidth
  const _setImageBounds = (width, height) => {
    const newWidth = width < contentWidth ? width : contentWidth;
    const newHeight = (height / width) * newWidth;
    setImgHeight(newHeight);
    setImgWidth(newWidth);
  };

  const imgStyle = {
    width: imgWidth,
    height: imgHeight,
    backgroundColor: onLoadCalled ? 'transparent' : EStyleSheet.value('$primaryLightBackground'),
  };

  const _onLoad = (evt) => {
    setOnLoadCalled(true);
    _setImageBounds(evt.nativeEvent.width, evt.nativeEvent.height);
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={isAnchored} activeOpacity={activeOpacity || 1}>
      <FastImage
        style={imgStyle}
        source={{ uri: imgUrl }}
        resizeMode={FastImage.resizeMode.contain}
        onLoad={_onLoad}
      />
    </TouchableOpacity>
  );
};
