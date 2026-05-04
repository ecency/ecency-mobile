import React from 'react';
import { View, ImageBackground, TouchableHighlight } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '..';
import styles from './postHtmlRendererStyles';

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
  return (
    <TouchableHighlight onPress={onPress} disabled={!onPress}>
      <View pointerEvents="none">
        <ImageBackground
          source={{ uri }}
          style={{ ...styles.videoThumb, width: contentWidth, height: contentWidth * heightRatio }}
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
