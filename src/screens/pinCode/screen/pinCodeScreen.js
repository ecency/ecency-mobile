import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { NumericKeyboard, PinAnimatedInput } from '../../../components';
import { UserAvatar } from '../../../components/userAvatar';

import styles from './pinCodeStyles';

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
      informationText, showForgotButton, username, intl,
    } = this.props;
    const { pin } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.logoView}>
          <UserAvatar username={username} size="xl" style={styles.avatar} />
        </View>
        <View style={styles.titleView}>
          <Text style={styles.title}>{`@${username}`}</Text>
        </View>
        <View style={styles.informationView}>
          <Text style={styles.informationText}>{informationText}</Text>
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
