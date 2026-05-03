import React, { useEffect, useRef } from 'react';
import { TextInput as RNTextInput, View } from 'react-native';

// Components
import { IconButton } from '../../iconButton';
import { TextInput } from '../../textInput';

// Styles
import styles from './searchInputStyles';

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
  const inputRef = useRef<RNTextInput | null>(null);
  const lastTextRef = useRef<string>(`${prefix}${value || ''}`);
  const isFocusedRef = useRef(false);

  const _setText = (text: string) => {
    lastTextRef.current = text;
    inputRef.current?.setNativeProps({ text });
  };

  // Sync from external value when not focused (e.g. parent reset).
  useEffect(() => {
    if (isFocusedRef.current) return;
    const next = `${prefix}${value || ''}`;
    if (next !== lastTextRef.current) {
      _setText(next);
    }
  }, [value, prefix]);

  const _onChangeText = (text: string) => {
    lastTextRef.current = text;
    let stripped = text;
    if (prefix !== '') {
      stripped = text.replace(prefix, '');
    }
    if (onChangeText) {
      onChangeText(stripped);
    }
  };

  const _renderCrossButton = (onPress) => (
    <IconButton
      iconStyle={styles.closeIcon}
      iconType="Ionicons"
      style={styles.closeIconButton}
      name="close-circle-outline"
      onPress={onPress}
    />
  );

  const _handleClear = () => {
    _setText('');
    if (onChangeText) {
      onChangeText('');
    }
  };

  const inputWrapperFlex = { flex: backEnabled ? 16 : 1 };

  return (
    <View style={styles.container}>
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
            innerRef={inputRef}
            style={styles.input}
            onChangeText={_onChangeText}
            onFocus={() => {
              isFocusedRef.current = true;
            }}
            onBlur={() => {
              isFocusedRef.current = false;
            }}
            placeholder={placeholder}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            autoFocus={autoFocus}
            editable={editable}
            defaultValue={`${prefix}${value || ''}`}
          />
        </View>
        {handleOnModalClose && _renderCrossButton(() => handleOnModalClose())}
        {showClearButton && _renderCrossButton(_handleClear)}
      </View>
    </View>
  );
};

export default SearchInputView;
