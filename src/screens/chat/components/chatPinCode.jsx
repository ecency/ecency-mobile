import React from 'react';
import { Keyboard, TextInput, TouchableWithoutFeedback, View, Text } from 'react-native';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import { FormattedMessage } from 'react-intl';
import styles from '../style/chatPinCode.style.ts';

export const ChatPinCode = ({
  pin,
  setPin,
  codeLength = 8,
  editable = true,
  errorMessage = '',
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <SmoothPinCodeInput
          editable={editable}
          codeLength={codeLength}
          cellStyle={styles.input}
          cellStyleFocused={styles.inputFocus}
          value={pin}
          onTextChange={setPin}
          autoFocus={false}
        />
        {errorMessage && (
          <Text style={styles.failText}>
            <FormattedMessage id={errorMessage} />
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};
