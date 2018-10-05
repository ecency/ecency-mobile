import React, { Component } from 'react';
import {
  Animated, Easing, TouchableOpacity, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Components
import SubPostButton from './subPostButtonView';

// Styles
import styles from './postButtonStyles';

const SIZE = 60;
const durationIn = 300;
const durationOut = 200;

class PostButtonView extends Component {
  mode = new Animated.Value(0);

  icon1 = new Animated.Value(0);

  icon2 = new Animated.Value(0);

  icon3 = new Animated.Value(0);

  toggleView = () => {
    if (this.mode._value) {
      Animated.parallel(
        [this.mode, this.icon1, this.icon2, this.icon3].map(item => Animated.timing(item, {
          toValue: 0,
          duration: durationIn,
          easing: Easing.cubic,
        })),
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(this.mode, {
          toValue: 1,
          duration: durationOut,
          easing: Easing.cubic,
        }),
        Animated.sequence([
          ...[this.icon1, this.icon2, this.icon3].map(item => Animated.timing(item, {
            toValue: 1,
            duration: durationOut,
            easing: Easing.elastic(1),
          })),
        ]),
      ]).start();
    }
  };

  render() {
    const firstX = this.icon1.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -20],
    });
    const firstY = this.icon1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -50],
    });
    const secondX = this.icon2.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 30],
    });
    const secondY = this.icon2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -80],
    });
    const thirdX = this.icon3.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 80],
    });
    const thirdY = this.icon3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -50],
    });

    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg'],
    });

    // const bluring = this.mode.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [10, 5],
    // });

    // const blurin2 = this.mode.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, -20],
    // });

    return (
      <View style={styles.postButtonWrapper}>
        <SubPostButton
          size={SIZE}
          style={{
            left: firstX,
            top: firstY,
          }}
          icon="camera"
        />
        <SubPostButton
          size={SIZE}
          style={{
            left: secondX,
            top: secondY,
          }}
          icon="pencil"
        />
        <SubPostButton
          size={SIZE}
          style={{
            left: thirdX,
            top: thirdY,
          }}
          icon="video-camera"
        />

        <TouchableOpacity onPress={this.toggleView} activeOpacity={1}>
          <Animated.View
            style={[
              styles.postButtonIcon,
              {
                transform: [{ rotate: rotation }],
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
              },
            ]}
          >
            <Icon name="plus" size={22} color="#F8F8F8" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default PostButtonView;
