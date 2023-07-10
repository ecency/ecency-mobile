import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Platform,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Popover, { usePopover } from 'react-native-modal-popover';

// Components
import { TextInput } from '../../textInput';
import { Icon } from '../../icon';
// Utils
import { getResizedAvatar } from '../../../utils/image';

// Styles
import styles from './formInputStyles';
import { useSelector } from 'react-redux';

interface Props extends TextInputProps {
  type: string;
  isFirstImage: boolean;
  isEditable?: boolean;
  leftIconName?: string;
  rightIconName?: string;
  iconType?: string;
  wrapperStyle: ViewStyle;
  height: number;
  inputStyle: TextStyle;
  isValid: boolean;
  rightInfoIcon?: boolean;
  errorInfo?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FormInputView = ({
  placeholder,
  type,
  isFirstImage,
  isEditable = true,
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
  rightInfoIcon,
  errorInfo,
  onBlur,
  onFocus,
  ...props
}: Props) => {
  const { openPopover, closePopover, popoverVisible, touchableRef, popoverAnchorRect } =
    usePopover();
  const inputRef = useRef(null);

  const [_value, setValue] = useState(value || '');
  const [inputBorderColor, setInputBorderColor] = useState('#e7e7e7');
  const [_isValid, setIsValid] = useState(true);
  const isDarkTheme = useSelector((state) => state.application.isDarkTheme);
  const isIos = Platform.OS === 'ios';

  const _handleOnChange = (text) => {
    setValue(text);

    if (onChange) {
      onChange(text);
    }
  };

  const _handleOnFocus = () => {
    setInputBorderColor('#357ce6');
    if (onFocus) {
      onFocus();
    }
  };

  const _handleOnBlur = () => {
    setInputBorderColor('#e7e7e7');
    if (onBlur) {
      onBlur();
    }
  };

  useEffect(() => {
    setValue(value);
  }, [value]);

  // TODO: Workaround for android context (copy/paste) menu, check react-navigation library
  useEffect(() => {
    if (!isIos) {
      if (!value) {
        setValue(' ');
        setTimeout(() => {
          setValue(value || '');
        }, 0);
      }
    }
  }, []);

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  const _handleInfoPress = () => {
    Keyboard.dismiss();
    // added delay between keyboard closing and popover opening,
    // immediate opening popover calculates wrong popover position
    setTimeout(() => {
      openPopover();
    }, 800);
  };

  const _handleClosePopover = () => {
    closePopover();
    // delayed keyboard opening to solve immediate keyboard open glitch
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 500);
  };

  const _renderInfoIconWithPopover = () => (
    <View style={styles.infoIconContainer}>
      <TouchableOpacity ref={touchableRef} onPress={_handleInfoPress}>
        <Icon iconType={'MaterialIcons'} name="info-outline" style={styles.infoIcon} />
      </TouchableOpacity>
      <Popover
        backgroundStyle={styles.overlay}
        contentStyle={styles.popoverDetails}
        arrowStyle={styles.arrow}
        visible={popoverVisible}
        onClose={_handleClosePopover}
        fromRect={popoverAnchorRect}
        supportedOrientations={['portrait', 'landscape']}
        placement="top"
      >
        <View style={styles.popoverWrapper}>
          <Text style={styles.popoverText}>{errorInfo}</Text>
        </View>
      </Popover>
    </View>
  );

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
        <TextInput
          innerRef={inputRef}
          style={inputStyle}
          onFocus={_handleOnFocus}
          onBlur={_handleOnBlur}
          autoCapitalize="none"
          secureTextEntry={secureTextEntry}
          height={height}
          placeholder={placeholder}
          editable={isEditable}
          textContentType={type}
          onChangeText={_handleOnChange}
          value={_value}
          placeholderTextColor={isDarkTheme ? '#526d91' : '#788187'}
          autoCorrect={false}
          contextMenuHidden={false}
          {...props}
        />
      </View>
      {rightInfoIcon && !isValid ? (
        _renderInfoIconWithPopover()
      ) : value && value.length > 0 ? (
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
