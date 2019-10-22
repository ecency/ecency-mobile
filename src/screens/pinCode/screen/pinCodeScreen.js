import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { Text, TouchableOpacity, View } from 'react-native';

import { NumericKeyboard, PinAnimatedInput } from '../../../components';
import { UserAvatar } from '../../../components';

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

  const _handleKeyboardOnPress = async value => {
    if (loading) {
      return;
    }
    if (value === 'clear') {
      setPin('');
      return;
    }
    const newPin = `${pin}${value}`;

    if (pin.length < 3) {
      setPin(newPin);
    } else if (pin.length === 3) {
      await setPin(newPin);
      await setLoading(true);

      await setPinCode(`${pin}${value}`);

      setPin('');
      setLoading(false);
    } else if (pin.length > 3) {
      setPin(`${value}`);
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
