import React, { Component } from 'react';
import {
  Animated, Easing, TouchableOpacity, View, Platform,
} from 'react-native';
import { Icon } from '../../icon';

// Components
import SubPostButton from './subPostButtonView';

// Constant
import { default as ROUTES } from '../../../constants/routeNames';

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

  constructor(props) {
    super(props);
    this.state = {
      isCollapse: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    // For closing sub buttons
    if (this.mode._value) {
      const { routes, isCollapsePostButtonOpen } = this.props;
      const nextRouteName = nextProps.routes[0].routes[nextProps.routes[0].routes.length - 1].routeName;
      const { routeName } = routes[0].routes[routes[0].routes.length - 1];
      const { isCollapse } = this.state;

      if (
        (routeName !== nextRouteName && nextRouteName !== ROUTES.DRAWER.MAIN)
        || (isCollapsePostButtonOpen !== nextProps.isCollapsePostButtonOpen
          && !nextProps.isCollapsePostButtonOpen
          && isCollapse !== nextProps.isCollapsePostButtonOpen)
      ) {
        this._toggleView();
      }
    }
  }

  _toggleView = () => {
    const { isCollapse } = this.state;
    const { handleButtonCollapse } = this.props;

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

    this.setState({ isCollapse: !isCollapse });
    handleButtonCollapse(!isCollapse);
  };

  render() {
    const firstX = this.icon1.interpolate({
      inputRange: [0, 1],
      outputRange: [25, -25],
    });
    const firstY = this.icon1.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, -70],
    });
    const secondX = this.icon2.interpolate({
      inputRange: [0, 1],
      outputRange: [25, 30],
    });
    const secondY = this.icon2.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, -95],
    });
    const thirdX = this.icon3.interpolate({
      inputRange: [0, 1],
      outputRange: [25, 85],
    });
    const thirdY = this.icon3.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, -70],
    });

    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg'],
    });

    const { handleSubButtonPress, handleButtonCollapse } = this.props;
    return (
      <View style={styles.postButtonWrapper}>
        <SubPostButton
          size={SIZE}
          style={{
            left: firstX,
            top: firstY,
          }}
          icon="create"
          onPress={() => handleSubButtonPress(ROUTES.SCREENS.EDITOR)}
        />
        <SubPostButton
          size={SIZE}
          style={{
            left: secondX,
            top: secondY,
          }}
          icon="camera-alt"
          onPress={() => handleSubButtonPress(ROUTES.SCREENS.EDITOR, 'image')}
        />
        <SubPostButton
          size={SIZE}
          style={{
            left: thirdX,
            top: thirdY,
          }}
          icon="videocam"
          onPress={() => handleSubButtonPress(ROUTES.SCREENS.EDITOR, 'camera')}
        />
        <TouchableOpacity
          onPress={() => (Platform.OS === 'ios'
            ? this._toggleView()
            : handleButtonCollapse(null, Platform.OS === 'android'))
          }
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.postButton,
              {
                transform: [{ rotate: rotation }],
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
              },
            ]}
          >
            <Icon name="add" size={24} iconType="MaterialIcons" color="#F8F8F8" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default PostButtonView;
