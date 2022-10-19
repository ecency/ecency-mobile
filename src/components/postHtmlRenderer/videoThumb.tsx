import React from 'react';
import { View, ImageBackground } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { IconButton } from '..';
import styles from './postHtmlRendererStyles';

interface Props {
  contentWidth: number;
  uri?: string;
  onPress?: () => void;
}

const VideoThumb = ({ contentWidth, uri, onPress }: Props) => {
  return (
    <TouchableHighlight onPress={onPress} disabled={!onPress}>
      <View pointerEvents="none">
        <ImageBackground
          source={{ uri }}
          style={{ ...styles.videoThumb, width: contentWidth, height: (contentWidth * 9) / 16 }}
          resizeMode="cover"
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
