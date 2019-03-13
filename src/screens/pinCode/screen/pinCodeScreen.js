import React, { PureComponent } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { NumericKeyboard, PinAnimatedInput } from '../../../components';
import { UserAvatar } from '../../../components/userAvatar';

import styles from './pinCodeStyles';

class PinCodeScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pin: '',
      loading: false,
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleKeyboardOnPress = async (value) => {
    const { setPinCode } = this.props;
    const { pin, loading } = this.state;
    if (loading) {
      return;
    }
    if (value === 'clear') {
      this.setState({ pin: '' });
      return;
    }
    const newPin = `${pin}${value}`;

    if (pin.length < 3) {
      this.setState({ pin: newPin });
    } else if (pin.length === 3) {
      await this.setState({ pin: newPin, loading: true });

      setPinCode(`${pin}${value}`)
        .then(() => {
          // TODO: fix unmounted component error
          this.setState({ pin: '', loading: false });
        })
        .catch(() => {
          this.setState({ pin: '', loading: false });
        });
    } else if (pin.length > 3) {
      this.setState({ pin: `${value}` });
    }
  };

  render() {
    const {
      informationText, showForgotButton, username, intl, handleForgotButton,
    } = this.props;
    const { pin, loading } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.logoView}>
          <UserAvatar noAction username={username} size="xl" style={styles.avatar} />
        </View>
        <View style={styles.titleView}>
          <Text style={styles.title}>{`@${username}`}</Text>
        </View>
        <View style={styles.informationView}>
          <Text style={styles.informationText}>{informationText}</Text>
        </View>
        <View style={styles.animatedView}>
          <PinAnimatedInput pin={pin} loading={loading} />
        </View>
        <View style={styles.numericKeyboardView}>
          <NumericKeyboard onPress={this._handleKeyboardOnPress} />
        </View>
        {showForgotButton ? (
          <TouchableOpacity onPress={() => handleForgotButton()} style={styles.forgotButtonView}>
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
