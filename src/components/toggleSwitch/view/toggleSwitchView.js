import React, { PureComponent } from 'react';
import { View, TouchableOpacity, NativeModules } from 'react-native';
import Animated, { EasingNode } from 'react-native-reanimated';

// Constants

// Components

// Styles
import styles from './toggleSwitchStyles';

class ToggleSwitchView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */
  offsetX = new Animated.Value(0);

  constructor(props) {
    super(props);
    this.state = {
      width: 68,
      padding: 12,
      circleWidth: 28,
      circleHeight: 28,
      translateX: 36,
      isOn: props.isOn,
    };
  }

  // Component Life Cycles

  componentDidMount() {
    this.setState({ duration: 300 });
  }

  // Component Functions
  _createCircleStyle = () => {
    const { circleWidth, circleHeight } = this.state;

    return {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      position: 'absolute',
      backgroundColor: 'white',
      transform: [{ translateX: this.offsetX }],
      width: circleWidth,
      marginLeft: 4,
      height: circleHeight,
      borderRadius: circleWidth / 2,
      shadowOpacity: 0.2,
      shadowOffset: {
        height: 1.5,
      },
      elevation: 3,
    };
  };

  _createSwitchStyle = () => {
    const { onColor, offColor } = this.props;
    const { padding, width, isOn } = this.state;

    return {
      justifyContent: 'center',
      width,
      borderRadius: 20,
      height: 35,
      padding,
      backgroundColor: isOn ? onColor || '#357ce6' : offColor || '#f5f5f5',
    };
  };

  _onToggle = () => {
    const { onToggle, latchBack } = this.props;
    const { isOn } = this.state;
    this.setState({ isOn: !isOn });

    // For debounce
    setTimeout(() => {
      if (onToggle) {
        onToggle(!isOn);
      }
      // this.setState({isOn})
    }, 300);

    if (latchBack) {
      setTimeout(() => {
        this.setState({ isOn });
      }, 500);
    }
  };

  _triggerAnimation = () => {
    const { width, translateX, isOn, duration } = this.state;
    const toValue = isOn ? width - (NativeModules.I18nManager.isRTL ? 100 : translateX) : 0; // in rtl layout, set the translate value to 100

    Animated.timing(this.offsetX, {
      toValue,
      duration,
      easing: EasingNode.inOut(EasingNode.ease),
    }).start();
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isOn !== this.props.isOn) {
      this.setState({ isOn: nextProps.isOn });
    }
  }

  UNSAFE_componentWillMount() {
    this.setState({ duration: 0 });
  }

  render() {
    this._triggerAnimation();

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={this._createSwitchStyle()}
          activeOpacity={0.8}
          onPress={() => {
            this._onToggle();
          }}
        >
          <Animated.View style={this._createCircleStyle()} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default ToggleSwitchView;
