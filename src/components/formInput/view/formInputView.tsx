import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import {
  View,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Text,
  TouchableOpacity,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Popover from 'react-native-popover-view';

// Components
import { TextInput } from '../../textInput';
import { Icon } from '../../icon';
import { selectIsDarkTheme } from '../../../redux/selectors';
import { useAppSelector } from '../../../hooks';
// Utils
import { getResizedAvatar } from '../../../utils/image';

// Styles
import styles from './formInputStyles';

export interface FormInputHandle {
  setText: (text: string) => void;
  focus: () => void;
  blur: () => void;
}

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

const FormInputView = forwardRef<FormInputHandle, Props>(
  (
    {
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
    },
    ref,
  ) => {
    const inputRef = useRef<RNTextInput>(null);
    const popoverRef = useRef(null);

    const [popoverVisible, setPopoverVisible] = useState(false);
    const [inputBorderColor, setInputBorderColor] = useState('#e7e7e7');
    const isDarkTheme = useAppSelector(selectIsDarkTheme);
    const isFocusedRef = useRef(false);
    // Tracks the most recent text the native field is showing — either typed by the user
    // or written via setNativeProps. Used to decide if parent prop sync is needed.
    const lastTextRef = useRef<string>(value || '');

    const _setText = (text: string) => {
      lastTextRef.current = text;
      inputRef.current?.setNativeProps({ text });
    };

    useImperativeHandle(ref, () => ({
      setText: _setText,
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    const _handleOnChange = (text: string) => {
      lastTextRef.current = text;
      if (onChange) {
        onChange(text);
      }
    };

    const _handleOnFocus = () => {
      isFocusedRef.current = true;
      setInputBorderColor('#357ce6');
      if (onFocus) {
        onFocus();
      }
    };

    const _handleOnBlur = () => {
      isFocusedRef.current = false;
      setInputBorderColor('#e7e7e7');
      // If parent normalized text during typing (e.g. login lowercases username)
      // and the field still shows the user's raw input, snap it to the parent value.
      const parentValue = value || '';
      if (parentValue !== lastTextRef.current) {
        _setText(parentValue);
      }
      if (onBlur) {
        onBlur();
      }
    };

    // Sync from parent prop when input is not focused — covers async hydration,
    // form resets, and programmatic value changes from outside.
    useEffect(() => {
      if (isFocusedRef.current) return;
      const parentValue = value || '';
      if (parentValue !== lastTextRef.current) {
        _setText(parentValue);
      }
    }, [value]);

    const _handleInfoPress = () => {
      Keyboard.dismiss();
      // added delay between keyboard closing and popover opening,
      // immediate opening popover calculates wrong popover position
      setTimeout(() => {
        setPopoverVisible(true);
      }, 800);
    };

    const _handleClosePopover = () => {
      setPopoverVisible(false);
      // delayed keyboard opening to solve immediate keyboard open glitch
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 500);
    };

    const _handleClearPress = () => {
      _setText('');
      if (onChange) {
        onChange('');
      }
    };

    const _renderInfoIconWithPopover = () => (
      <View style={styles.infoIconContainer}>
        <TouchableOpacity ref={popoverRef} onPress={_handleInfoPress}>
          <Icon iconType="MaterialIcons" name="info-outline" style={styles.infoIcon} />
        </TouchableOpacity>
        <Popover
          backgroundStyle={styles.overlay}
          popoverStyle={styles.popoverDetails}
          isVisible={popoverVisible}
          onRequestClose={_handleClosePopover}
          from={popoverRef}
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
          { borderBottomColor: isValid ? inputBorderColor : 'red' },
          wrapperStyle,
        ]}
      >
        {isFirstImage && isValid && value && value.length > 2 ? (
          <View style={{ flex: 0.15 }}>
            <ExpoImage
              style={styles.firstImage}
              source={{
                uri: getResizedAvatar(value),
              }}
              contentFit="cover"
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
            defaultValue={value || ''}
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
            onPress={_handleClearPress}
            name={leftIconName}
            style={styles.icon}
          />
        ) : null}
      </View>
    );
  },
);

export default FormInputView;
