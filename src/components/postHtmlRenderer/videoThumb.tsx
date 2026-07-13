import React from 'react';
import { View, ImageBackground, TouchableHighlight } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '..';
import styles from './postHtmlRendererStyles';
import { useImageReveal } from '../../hooks/useImageReveal';

interface Props {
  contentWidth: number;
  uri?: string;
  onPress?: () => void;
  heightRatio?: number;
  resizeMode?: 'cover' | 'contain';
}

const VideoThumb = ({
  contentWidth,
  uri,
  onPress,
  heightRatio = 9 / 16,
  resizeMode = 'cover',
}: Props) => {
  const { isHidden } = useImageReveal(uri);

  return (
    <TouchableHighlight onPress={onPress} disabled={!onPress}>
      <View pointerEvents="none">
        <ImageBackground
          // The poster is a content image, so "Show Images" suppresses it. The
          // styled box keeps its play button, so a tap still opens the video.
          source={isHidden ? undefined : { uri }}
          style={{
            ...styles.videoThumb,
            width: contentWidth,
            height: contentWidth * heightRatio,
            // portrait (3Speak) thumbs use 'contain', so keep the letterbox bars
            // transparent to blend with the card instead of showing the fill color
            ...(resizeMode === 'contain' ? { backgroundColor: 'transparent' } : null),
          }}
          resizeMode={resizeMode}
        >
          <IconButton
            style={styles.playButton}
            size={44}
            name="play-arrow"
            color={EStyleSheet.value('$white')}
            iconType="MaterialIcons"
          />
        </ImageBackground>
      </View>
    </TouchableHighlight>
  );
};

export default VideoThumb;
