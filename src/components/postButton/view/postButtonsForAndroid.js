import React, { Component } from 'react';
import { Animated, Easing, View } from 'react-native';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';

// Components
import SubPostButton from './subPostButtonView';

import { isCollapsePostButton } from '../../../redux/actions/uiAction';

// Constant
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './postButtonStyles';

const SIZE = 60;
const durationIn = 300;
const durationOut = 200;

class PostButtonsForAndroid extends Component {
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
    console.log('nextProps :', nextProps);
    // For closing sub buttons
    const { routes, isCollapsePostButtonOpen } = this.props;
    const nextRouteName = nextProps.routes[0].routes[nextProps.routes[0].routes.length - 1].routeName;
    const routeName = routes[0].routes[routes[0].routes.length - 1].routeName;
    const { isCollapse } = this.state;

    if (
      (routeName !== nextRouteName && nextRouteName !== ROUTES.DRAWER.MAIN)
      || (isCollapsePostButtonOpen !== nextProps.isCollapsePostButtonOpen
        && isCollapse !== nextProps.isCollapsePostButtonOpen)
    ) {
      this._toggleView();
    }
  }

  _toggleView = () => {
    const { isCollapse } = this.state;

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
    this._handleButtonCollapse(!isCollapse);
  };

  _handleButtonCollapse = (status) => {
    const { dispatch, isCollapsePostButtonOpen } = this.props;

    if (isCollapsePostButtonOpen !== status) {
      dispatch(isCollapsePostButton(status));
    }
  };

  _handleSubButtonPress = (route, action) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: route,
      params: {
        action,
      },
    });

    // navigation.navigate(route);
  };

  render() {
    const firstX = this.icon1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -50],
    });
    const firstY = this.icon1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -70],
    });
    const secondX = this.icon2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0],
    });
    const secondY = this.icon2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -95],
    });
    const thirdX = this.icon3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 50],
    });
    const thirdY = this.icon3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -70],
    });

    return (
      <View
        style={{
          justifyContent: 'center',
        }}
      >
        <SubPostButton
          size={SIZE}
          style={{
            left: firstX,
            top: firstY,
            position: 'relative',
          }}
          icon="video-camera"
          onPress={() => this._handleSubButtonPress(ROUTES.SCREENS.EDITOR, 'camera')}
        />
        <SubPostButton
          size={SIZE}
          style={{
            left: secondX,
            top: secondY,
            position: 'relative',
          }}
          icon="pencil"
          onPress={() => this._handleSubButtonPress(ROUTES.SCREENS.EDITOR)}
        />
        <SubPostButton
          size={SIZE}
          style={{
            left: thirdX,
            top: thirdY,
            position: 'relative',
          }}
          icon="camera"
          onPress={() => this._handleSubButtonPress(ROUTES.SCREENS.EDITOR, 'image')}
        />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  routes: state.nav.routes,
  isCollapsePostButtonOpen: state.ui.isCollapsePostButton,
});

export default connect(mapStateToProps)(withNavigation(PostButtonsForAndroid));
