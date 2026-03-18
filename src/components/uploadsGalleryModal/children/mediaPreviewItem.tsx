import React, { useEffect, useRef, useState } from 'react';
import { proxifyImageSrc } from '@ecency/render-helper';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Image as ExpoImage } from 'expo-image';
import { default as AnimatedView, ZoomIn } from 'react-native-reanimated';
import { Icon } from '../..';
import styles from './uploadsGalleryModalStyles';
import { MediaItem } from '../../../providers/ecency/ecency.types';

interface Props {
  item: MediaItem;
  insertedMediaUrls: string[];
  isDeleteMode: boolean;
  isDeleting: boolean;
  deleteIds: string[];
  isExpandedMode: boolean;
  isViewable: boolean;
  onPress: () => void;
}

export const MediaPreviewItem = ({
  item,
  insertedMediaUrls,
  isDeleteMode,
  isDeleting,
  deleteIds,
  isExpandedMode,
  isViewable,
  onPress,
}: Props) => {
  const imgRef = useRef<ExpoImage>(null);
  const isInViewRef = useRef(false);

  const [isAnimated, setIsAnimated] = useState(false);
  const [autoPlay, setAutoplay] = useState(false);

  useEffect(() => {
    if (isAnimated) {
      _toggleGif(isViewable);
    }
  }, [isViewable]);

  const thumbUrl = item.thumbUrl || proxifyImageSrc(item.url, 200, 200, 'match');

  let isInsertedTimes = 0;
  insertedMediaUrls?.forEach((url) => {
    isInsertedTimes += url === item.url ? 1 : 0;
  });
  const isToBeDeleted = deleteIds.indexOf(item._id) >= 0;
  const transformStyle = {
    transform: isToBeDeleted ? [{ scaleX: 0.7 }, { scaleY: 0.7 }] : [],
  };

  const _renderMinus = () =>
    isDeleteMode && (
      <AnimatedView.View entering={ZoomIn} style={styles.minusContainer}>
        <Icon
          color={EStyleSheet.value('$pureWhite')}
          iconType="MaterialCommunityIcons"
          name="minus"
          size={20}
        />
      </AnimatedView.View>
    );

  const _renderCounter = () =>
    isInsertedTimes > 0 &&
    !isDeleteMode && (
      <AnimatedView.View entering={ZoomIn} style={styles.counterContainer}>
        <Text style={styles.counterText}>{isInsertedTimes}</Text>
      </AnimatedView.View>
    );

  const handlePress = () => {
    onPress();
  };

  const _toggleGif = (inView: boolean) => {
    isInViewRef.current = inView;
    if (Platform.OS === 'ios') {
      setAutoplay(inView);
    } else {
      imgRef.current?.[inView ? 'startAnimating' : 'stopAnimating']();
    }
  };

  const _onLoad = (evt) => {
    const _isAnimated = evt.source?.isAnimated;
    setIsAnimated(_isAnimated);
    if (_isAnimated) {
      _toggleGif(isInViewRef.current);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={isDeleting}>
      <View style={transformStyle}>
        <ExpoImage
          ref={imgRef}
          onLoad={_onLoad}
          pointerEvents={isExpandedMode ? 'auto' : 'none'}
          source={{ uri: thumbUrl }}
          autoplay={autoPlay}
          style={isExpandedMode ? styles.gridMediaItem : styles.mediaItem}
        />
        {isAnimated && (
          <>
            <View style={styles.gifBadge}>
              <Text style={styles.gifBadgeText}>GIF</Text>
            </View>
          </>
        )}
        {_renderCounter()}
        {_renderMinus()}
      </View>
    </TouchableOpacity>
  );
};
