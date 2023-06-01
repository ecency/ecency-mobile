import React, { useState, useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';

// Components
import { Icon } from '../../icon';
import { IconButton } from '../../iconButton';
import { TextInput } from '../../textInput';

// Styles
import styles from './searchInputStyles';

/* Props
 * ------------------------------------------------
 *   @prop { func }    onChangeText            - The function will trigger when input on change
 *   @prop { func }    handleOnModalClose      - Handle on click method for close button
 *   @prop { string }  placeholder             - Placeholder for input
 *   @prop { bool }    editable                - Editable value for input. Default value is true.
 */
const SearchInputView = ({
  onChangeText,
  handleOnModalClose,
  placeholder,
  value = '',
  editable = true,
  autoFocus = true,
  showClearButton = false,
  prefix = '',
  style,
  backEnabled = false,
  onBackPress,
  backIconName,
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const _onChangeText = (text) => {
    if (prefix !== '') {
      text = text.replace(prefix, '');
    }
    setInputValue(text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const _renderCrossButton = (onPress) => (
    <IconButton
      iconStyle={styles.closeIcon}
      iconType="Ionicons"
      style={styles.closeIconButton}
      name="ios-close-circle-outline"
      onPress={onPress}
    />
  );

  const inputWrapperFlex = { flex: backEnabled ? 16 : 1 };

  return (
    <SafeAreaView style={styles.container}>
      {backEnabled && (
        <View style={styles.backButtonContainer}>
          <IconButton
            iconType="MaterialIcons"
            name={backIconName || 'arrow-back'}
            iconStyle={styles.backIcon}
            onPress={onBackPress}
          />
        </View>
      )}

      <View style={[styles.inputWrapper, inputWrapperFlex, style]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={_onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            autoFocus={autoFocus}
            editable={editable}
            value={`${prefix}${inputValue}`}
          />
        </View>
        {handleOnModalClose && _renderCrossButton(() => handleOnModalClose())}
        {showClearButton && _renderCrossButton(() => setInputValue(''))}
      </View>
    </SafeAreaView>
  );
};

export default SearchInputView;
