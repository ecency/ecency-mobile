import React, { PureComponent } from 'react';
import { View, Animated, Easing } from 'react-native';

import { Indicator } from './indicator';
import styles from './spinIndicatorStyles';

class SpinIndicator extends PureComponent {
  _renderComponent = ({ index, progress }) => {
    const { size, color, animationDuration, breadth, animating, initStart } = this.props;

    const frames = (60 * animationDuration) / 1000;
    const easing = Easing.bezier(0.4, 0.0, 0.7, 1.0);

    const inputRange = Array.from(
      new Array(frames),
      (undefined, frameIndex) => frameIndex / (frames - 1),
    );

    const outputRange = Array.from(new Array(frames), (undefined, frameIndex) => {
      let _progress = (2 * frameIndex) / (frames - 1);
      const rotation = index ? +(360 - 15) : -(180 - 15);

      if (_progress > 1.0) {
        _progress = 2.0 - _progress;
      }

      const direction = index ? -1 : +1;

      return `${direction * (180 - 30) * easing(_progress) + rotation}deg`;
    });

    const layerStyle = {
      width: size,
      height: size,
      transform: [
        {
          rotate: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [`${initStart + 30 + 15}deg`, `${2 * (360 + initStart)}deg`],
          }),
        },
      ],
    };

    const viewportStyle = {
      width: size,
      height: size,
      transform: [
        {
          translateY: index ? -size / 2 : 0,
        },
        {
          rotate: progress.interpolate({ inputRange, outputRange }),
        },
      ],
    };

    const containerStyle = {
      width: !animating ? 300 : size,
      height: !animating ? 300 : size / 2,
      position: 'absolute',
      overflow: 'hidden',
    };

    const offsetStyle = index ? { top: size / 2 } : null;

    const lineStyle = {
      width: size,
      height: size,
      borderColor: color,
      borderWidth: breadth || size / 10,
      borderRadius: size / 2,
    };

    return (
      <Animated.View style={styles.layer} {...{ key: index }}>
        <Animated.View style={layerStyle}>
          <Animated.View style={[containerStyle, offsetStyle]} collapsable={false}>
            <Animated.View style={viewportStyle}>
              <Animated.View style={containerStyle} collapsable={false}>
                <Animated.View style={lineStyle} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    );
  };

  render() {
    const {
      style,
      size: width,
      size: height,
      animationDuration,
      interaction,
      animating,
      animationEasing,
    } = this.props;

    return (
      <View style={[styles.container, style]}>
        <Indicator
          style={{ width, height }}
          renderComponent={this._renderComponent}
          interaction={interaction}
          animationEasing={animationEasing}
          animationDuration={animationDuration}
          animating={animating}
          count={2}
        />
      </View>
    );
  }
}

SpinIndicator.defaultProps = {
  animationDuration: 2400,
  color: '#1a509a',
  animating: true,
  size: 40,
  initStart: 0,
};

export { SpinIndicator };
