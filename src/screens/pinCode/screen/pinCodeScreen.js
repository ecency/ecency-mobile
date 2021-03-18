import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { Text, TouchableOpacity, View } from 'react-native';

import { NumericKeyboard, PinAnimatedInput, UserAvatar } from '../../../components';

import styles from './pinCodeStyles';

const PinCodeScreen = ({
  informationText,
  showForgotButton,
  username,
  handleForgotButton,
  setPinCode,
}) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    _handlePinComplete();
  }, [pin]);

  const _handlePinComplete = async () => {
    if (pin.length === 4) {
      setLoading(true);
      await setPinCode(pin);
      setPin('');
      setLoading(false);
    }
  };

  const _handleKeyboardOnPress = async (value) => {
    try {
      if (loading) {
        return;
      }
      if (value === 'clear') {
        setPin('');
        return;
      }
      const newPin = `${pin}${value}`;

      if (pin.length < 4) {
        setPin(newPin);
      } else if (pin.length >= 4) {
        setPin(`${value}`);
      }
    } catch (err) {
      console.warn('Failed to handle keyboard press as expected', err);
    }
  };

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
        <NumericKeyboard onPress={_handleKeyboardOnPress} />
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
};

export default PinCodeScreen;
