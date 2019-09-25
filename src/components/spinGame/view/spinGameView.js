// import React, { Component, Children } from 'react';
// import { View, Animated, PanResponder, Easing, ImageBackground, Image } from 'react-native';
// import RouletteItem from './rouletteItem';
// import styles from './styles';

// class Roulette extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       _animatedValue: new Animated.Value(0),
//       activeItem: 0,
//     };

//     this.step = props.step || (2 * Math.PI) / props.options.length;

//     this.panResponder = PanResponder.create({
//       onMoveShouldSetResponderCapture: () => true,
//       onMoveShouldSetPanResponderCapture: () => true,
//       onPanResponderRelease: () => {
//         const { enableUserRotate } = this.props;

//         if (enableUserRotate) this.triggerSpin();
//       },
//     });
//   }

//   triggerSpin(spinToIndex) {
//     const { options, turns, onRotate, onRotateChange, duration, easing } = this.props;
//     const { activeItem } = this.state;
//     const randomSelected = Math.floor(Math.random() * options.length);
//     const selectedIndex = spinToIndex != null ? spinToIndex : randomSelected;
//     const turnsMultiplier = options.length * turns;
//     const nextItem = selectedIndex + turnsMultiplier;

//     this.state._animatedValue.setValue(activeItem);
//     const animation = Animated.timing(this.state._animatedValue, {
//       toValue: nextItem,
//       easing,
//       duration,
//     });
//     if (onRotateChange) onRotateChange('start');
//     animation.start(() => {
//       if (onRotateChange) onRotateChange('stop');
//     });

//     let newActiveItem = nextItem > options.length ? nextItem % options.length : nextItem;
//     if (newActiveItem == 0) {
//       newActiveItem = options.length;
//     }
//     this.setState(
//       { activeItem: newActiveItem },
//       () => onRotate && onRotate(options[options.length - newActiveItem]),
//     );
//   }

//   render() {
//     const {
//       options,
//       radius,
//       distance,
//       customStyle,
//       rouletteRotate,
//       background,
//       marker,
//       centerImage,
//       markerWidth,
//       markerTop,
//       centerWidth,
//       centerTop,
//       markerStyle,
//       centerStyle,
//       rotateEachElement,
//     } = this.props;

//     const interpolatedRotateAnimation = this.state._animatedValue.interpolate({
//       inputRange: [0, options.length],
//       outputRange: [`${rouletteRotate}deg`, `${360 + rouletteRotate}deg`],
//     });

//     const displayOptions =
//       options && options.length > 0 && options[0] && React.isValidElement(options[0]);

//     return (
//       <View>
//         <Animated.View
//           {...this.panResponder.panHandlers}
//           style={[
//             styles.container,
//             { width: radius, height: radius, borderRadius: radius / 2 },
//             { transform: [{ rotate: interpolatedRotateAnimation }] },
//             customStyle,
//           ]}
//         >
//           <ImageBackground
//             width={radius}
//             height={radius}
//             style={{ width: radius, height: radius, zIndex: 100 }}
//             source={background}
//           >
//             {displayOptions &&
//               Children.map(options, (child, index) => (
//                 <RouletteItem
//                   item={child}
//                   index={index}
//                   radius={radius}
//                   step={this.step}
//                   distance={distance}
//                   rouletteRotate={rotateEachElement(index)}
//                 />
//               ))}
//           </ImageBackground>
//         </Animated.View>
//         <Image
//           source={marker}
//           resizeMode="contain"
//           style={[
//             styles.marker,
//             {
//               zIndex: 9999,
//               top: markerTop,
//               width: markerWidth,
//               left: radius / 2 - markerWidth / 2,
//             },
//             markerStyle,
//           ]}
//         />

//         {centerImage && (
//           <Image
//             source={centerImage}
//             resizeMode="contain"
//             style={[
//               styles.marker,
//               {
//                 zIndex: 9999,
//                 top: centerTop,
//                 width: centerWidth,
//                 left: radius / 2 - centerWidth / 2,
//               },
//               centerStyle,
//             ]}
//           />
//         )}
//       </View>
//     );
//   }
// }

// Roulette.defaultProps = {
//   radius: 300,
//   distance: 100,
//   rouletteRotate: 0,
//   enableUserRotate: false,
//   background: null,
//   turns: 5,
//   rotateEachElement: index => 0,
//   // onRotate: () => {},
//   // onRotateChange: () => {},
//   duration: 3500,
//   easing: Easing.inOut(Easing.ease),
//   markerTop: 0,
//   markerWidth: 20,
//   centerWidth: 20,
//   centerTop: 0,
//   centerImage: null,
//   markerStyle: {},
// };

// export default Roulette;

import React, { PureComponent } from 'react';
import { View, Animated, Easing } from 'react-native';

import Indicator from './indicator';
import styles from './styles';

export default class MaterialIndicator extends PureComponent {
  static defaultProps = {
    animationDuration: 2400,

    color: 'rgb(0, 0, 0)',
    size: 40,
  };

  constructor(props) {
    super(props);

    this.renderComponent = this.renderComponent.bind(this);
  }

  renderComponent({ index, count, progress }) {
    const { size, color, animationDuration } = this.props;

    const frames = (60 * animationDuration) / 1000;
    const easing = Easing.bezier(0.4, 0.0, 0.7, 1.0);

    const inputRange = Array.from(
      new Array(frames),
      (undefined, frameIndex) => frameIndex / (frames - 1),
    );

    const outputRange = Array.from(new Array(frames), (undefined, frameIndex) => {
      let progress = (2 * frameIndex) / (frames - 1);
      const rotation = index ? +(360 - 15) : -(180 - 15);

      if (progress > 1.0) {
        progress = 2.0 - progress;
      }

      const direction = index ? -1 : +1;

      return direction * (180 - 30) * easing(progress) + rotation + 'deg';
    });

    const layerStyle = {
      width: size,
      height: size,
      transform: [
        {
          rotate: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0 + 30 + 15 + 'deg', 2 * 360 + 30 + 15 + 'deg'],
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
      width: size,
      height: size / 2,
      overflow: 'hidden',
    };

    const offsetStyle = index ? { top: size / 2 } : null;

    const lineStyle = {
      width: size,
      height: size,
      borderColor: color,
      borderWidth: size / 10,
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
  }

  render() {
    const { style, size: width, size: height, ...props } = this.props;

    return (
      <View style={[styles.container, style]}>
        <Indicator
          style={{ width, height }}
          renderComponent={this.renderComponent}
          {...props}
          count={2}
        />
      </View>
    );
  }
}
