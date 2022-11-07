import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useIntl } from 'react-intl';

import { Text, TouchableOpacity, View } from 'react-native';
import { IconButton, NumericKeyboard, PinAnimatedInput, UserAvatar } from '../../../components';

import styles from './pinCodeStyles';

const PinCodeView = forwardRef(
  (
    {
      informationText,
      showForgotButton,
      username,
      handleForgotButton,
      setPinCode,
      hideCloseButton,
    },
    ref,
  ) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const intl = useIntl();
    const navigation = useNavigation();

    useImperativeHandle(ref, () => ({
      setPinThroughBiometric(bioPin) {
        if (bioPin && bioPin.length === 4) {
          setLoading(true);
          setPin(bioPin);
        }
      },
    }));

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

    const _handleBackPress = () => {
      navigation.goBack();
    };

    return (
      <View style={styles.container}>
        {!hideCloseButton && (
          <View style={styles.backIconContainer}>
            <IconButton
              iconStyle={styles.backIcon}
              iconType="MaterialIcons"
              name="close"
              onPress={_handleBackPress}
            />
          </View>
        )}

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
  },
);

export default PinCodeView;
