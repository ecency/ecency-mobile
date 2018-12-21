import React, { PureComponent } from 'react';
import { Animated } from 'react-native';

// Styles
import styles from './pinAnimatedInputStyles';

class PinAnimatedInput extends PureComponent {
  /* Props
   *
   *   @prop { string }    pin            - Description.
   *
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { pin } = this.props;
    const test = new Animated.Value(0);
    const tilt = test.interpolate({
      inputRange: [0, 0.3, 0.6, 0.9],
      outputRange: [0, -50, 50, 0],
    });
    return (
      <Animated.View
        style={[
          {
            transform: [{ translateX: tilt }],
          },
          styles.container,
        ]}
      >
        {[...Array(4)].map((val, index) => {
          if (pin.length > index) {
            return (
              <Animated.View key={`passwordItem-${index}`} style={styles.input}>
                <Animated.View
                  key={`passwordItem-${index}`}
                  style={[styles.input, styles.inputWithBackground]}
                />
              </Animated.View>
            );
          }
          return <Animated.View key={`passwordItem-${index}`} style={styles.input} />;
        })}
      </Animated.View>
    );
  }
}

export default PinAnimatedInput;
