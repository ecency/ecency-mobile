import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';

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

class ProgressiveImage extends React.Component {
  thumbnailAnimated = new Animated.Value(0);

  imageAnimated = new Animated.Value(0);

  handleThumbnailLoad = () => {
    Animated.timing(this.thumbnailAnimated, {
      toValue: 1,
    }).start();
  };

  onImageLoad = () => {
    Animated.timing(this.imageAnimated, {
      toValue: 1,
    }).start();
  };

  render() {
    const { thumbnailSource, source, style, ...props } = this.props;

    return (
      <View style={styles.container}>
        <AnimatedFastImage
          {...props}
          source={thumbnailSource}
          style={[style, { opacity: this.thumbnailAnimated }]}
          onLoad={this.handleThumbnailLoad}
          blurRadius={1}
          resizeMode={FastImage.resizeMode.cover}
        />
        <AnimatedFastImage
          {...props}
          source={source}
          style={[styles.imageOverlay, { opacity: this.imageAnimated }, style]}
          onLoad={this.onImageLoad}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
    );
  }
}

export default ProgressiveImage;
