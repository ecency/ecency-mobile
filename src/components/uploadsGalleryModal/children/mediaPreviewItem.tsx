import React, { useRef, useState } from 'react';
import { proxifyImageSrc } from '@ecency/render-helper';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Image as ExpoImage } from 'expo-image';
import { default as AnimatedView, ZoomIn } from 'react-native-reanimated';
import { useIntl } from 'react-intl';
import { Icon } from '../..';
import styles from './uploadsGalleryModalStyles';
import { MediaItem } from '../../../providers/ecency/ecency.types';
import { ThreeSpeakStatus } from '../../../providers/speak/speak.types';

interface Props {
  item: MediaItem;
  insertedMediaUrls: string[];
  isDeleteMode: boolean;
  isDeleting: boolean;
  deleteIds: string[];
  isExpandedMode: boolean;
  onPress: () => void;
}

export const MediaPreviewItem = ({
  item,
  insertedMediaUrls,
  isDeleteMode,
  isDeleting,
  deleteIds,
  isExpandedMode,
  onPress,
}: Props) => {
  const intl = useIntl();
  const imgRef = useRef<ExpoImage>(null);

  const [isAnimated, setIsAnimated] = useState(false);

  const thumbUrl =
    item.thumbUrl ||
    proxifyImageSrc(item.url, 200, 200, Platform.OS === 'ios' ? 'match' : 'webp');

  const [isPlaying, setIsPlaying] = useState(false);

  const previewUri = isAnimated && isExpandedMode ? item.url : thumbUrl;

  let isInsertedTimes = 0;
  insertedMediaUrls?.forEach((url) => {
    isInsertedTimes += url === item.url ? 1 : 0;
  });
  const isToBeDeleted = deleteIds.indexOf(item._id) >= 0;
  const transformStyle = {
    transform: isToBeDeleted ? [{ scaleX: 0.7 }, { scaleY: 0.7 }] : [],
  };

  const statusStyle = { ...styles.statusContainer, right: isExpandedMode ? 8 : 0 };

  const _renderStatus = () =>
    item.speakData && (
      <View style={statusStyle}>
        <Text style={styles.statusText}>
          {intl.formatMessage({ id: `uploads_modal.${item.speakData?.status}` })}
        </Text>
      </View>
    );

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

  const _renderLoading = () =>
    (item.speakData?.status === ThreeSpeakStatus.PREPARING ||
      item.speakData?.status === ThreeSpeakStatus.ENCODING) && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );

  const handlePress = () => {
    if (isAnimated && !isPlaying && isExpandedMode) {
      imgRef.current?.startAnimating();
      setIsPlaying(true);
    } else {
      onPress();
    }
  };


  const _onLoad = (evt) => {
    setIsAnimated(evt.source?.isAnimated)
  }

  return (
    <TouchableOpacity onPress={handlePress} disabled={isDeleting}>
      <View style={transformStyle}>
        <ExpoImage
          // Disable stray touches on thumbnails but allow gestures when expanded
          ref={imgRef}
          onLoad={_onLoad}
          pointerEvents={isExpandedMode ? 'auto' : 'none'}
          source={{ uri: previewUri }}
          autoplay={false}
          style={isExpandedMode ? styles.gridMediaItem : styles.mediaItem}
        />
        {isAnimated && (
          <>
            <View style={styles.gifBadge}>
              <Text style={styles.gifBadgeText}>GIF</Text>
            </View>
            {isExpandedMode && !isPlaying && (
              <View style={styles.playIconContainer}>
                <Icon
                  name="play-arrow"
                  iconType="MaterialIcons"
                  size={36}
                  color={EStyleSheet.value('$pureWhite')}
                />
              </View>
            )}
          </>
        )}
        {_renderCounter()}
        {_renderStatus()}
        {_renderMinus()}
        {_renderLoading()}
      </View>
    </TouchableOpacity>
  );
};
