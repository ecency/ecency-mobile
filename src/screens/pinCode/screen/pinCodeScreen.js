import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { NumericKeyboard, PinAnimatedInput } from '../../../components';

import styles from './pinCodeStyles';

const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');

class PinCodeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: '',
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleKeyboardOnPress = (value) => {
    const { setPinCode } = this.props;
    const { pin } = this.state;

    if (value === 'clear') {
      this.setState({ pin: '' });
      return;
    }
    const newPin = `${pin}${value}`;

    if (pin.length < 3) {
      this.setState({ pin: newPin });
    } else if (pin.length === 3) {
      this.setState({ pin: newPin });
      setPinCode(`${pin}${value}`)
        .then(() => {
          // TODO: fix unmounted component error
          this.setState({ pin: '' });
        })
        .catch(() => {
          this.setState({ pin: '' });
        });
    } else if (pin.length > 3) {
      this.setState({ pin: `${value}` });
    }
  };

  render() {
    const {
      informationText, showForgotButton, username, avatar, intl,
    } = this.props;
    const { pin } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.logoView}>
          <FastImage style={styles.avatar} source={{ uri: avatar }} defaultSource={DEFAULT_IMAGE} />
        </View>
        <View style={styles.titleView}>
          <Text style={styles.title}>{`@${username}`}</Text>
        </View>
        <View style={styles.informationView}>
          <Text>{informationText}</Text>
        </View>
        <View style={styles.animatedView}>
          <PinAnimatedInput pin={pin} />
        </View>
        <View style={styles.numericKeyboardView}>
          <NumericKeyboard onPress={this._handleKeyboardOnPress} />
        </View>
        {showForgotButton ? (
          <TouchableOpacity style={styles.forgotButtonView}>
            <Text style={styles.forgotButtonText}>
              {intl.formatMessage({
                id: 'pincode.forgot_text',
              })}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.forgotButtonView} />
        )}
      </View>
    );
  }
}

export default PinCodeScreen;
