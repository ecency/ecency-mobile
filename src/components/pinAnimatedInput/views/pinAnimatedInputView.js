/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { View } from 'react-native';
import * as Animatable from 'react-native-animatable';

// Styles
import styles from './pinAnimatedInputStyles';

class PinAnimatedInput extends Component {
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
    var dotsArr = Array(4).fill('');
    return (
      <View style={[styles.container]}>
        {dotsArr.map((val, index) => {
          if (pin.length > index) {
            return (
              <Animatable.View
                animation="fadeIn"
                duration={100}
                key={`passwordItem-${index}`}
                style={[styles.input, styles.inputWithBackground]}
                useNativeDriver
              />
            );
          }
          return <View key={`passwordItem-${index}`} style={styles.input} />;
        })}
      </View>
    );
  }
}

export default PinAnimatedInput;
/* eslint-enable */
