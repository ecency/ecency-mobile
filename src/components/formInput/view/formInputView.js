import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';

// Components
import { TextInput } from '../../textInput';
import { Icon } from '../../icon';
import { ThemeContainer } from '../../../containers';

// Utils
import { getResizedAvatar } from '../../../utils/image';

// Styles
import styles from './formInputStyles';

const FormInputView = ({
  placeholder,
  type,
  isFirstImage,
  isEditable,
  leftIconName,
  rightIconName,
  secureTextEntry,
  iconType,
  wrapperStyle,
  height,
  inputStyle,
  onChange,
  isValid,
  value,
}) => {
  const [_value, setValue] = useState(value || '');
  const [inputBorderColor, setInputBorderColor] = useState('#e7e7e7');
  const [_isValid, setIsValid] = useState(true);

  const _handleOnChange = text => {
    setValue(text);

    if (onChange) {
      onChange(text);
    }
  };

  const _handleOnFocus = () => {
    setInputBorderColor('#357ce6');
  };

  // Workaround for android context (copy/paste) menu
  useEffect(() => {
    setValue(' ');
    setTimeout(() => {
      setValue('');
    }, 1);
  }, []);

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  return (
    <View
      style={[
        styles.wrapper,
        { borderBottomColor: _isValid ? inputBorderColor : 'red' },
        wrapperStyle,
      ]}
    >
      {isFirstImage && value && value.length > 2 ? (
        <View style={{ flex: 0.15 }}>
          <FastImage
            style={styles.firstImage}
            source={{
              uri: getResizedAvatar(value),
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      ) : (
        rightIconName && (
          <Icon iconType={iconType || 'MaterialIcons'} name={rightIconName} style={styles.icon} />
        )
      )}
      <View style={styles.textInput}>
        <ThemeContainer>
          {({ isDarkTheme }) => (
            <TextInput
              style={inputStyle}
              onFocus={_handleOnFocus}
              onBlur={() => setInputBorderColor('#e7e7e7')}
              autoCapitalize="none"
              secureTextEntry={secureTextEntry}
              height={height}
              placeholder={placeholder}
              editable={isEditable || true}
              textContentType={type}
              onChangeText={_handleOnChange}
              value={_value}
              placeholderTextColor={isDarkTheme ? '#526d91' : '#788187'}
              autoCorrect={false}
              contextMenuHidden={false}
            />
          )}
        </ThemeContainer>
      </View>

      {value && value.length > 0 ? (
        <Icon
          iconType={iconType || 'MaterialIcons'}
          onPress={() => setValue('')}
          name={leftIconName}
          style={styles.icon}
        />
      ) : null}
    </View>
  );
};

export default FormInputView;
