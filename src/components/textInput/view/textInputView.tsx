import React, { Ref, useMemo } from 'react';
import { TextInput, I18nManager, TextInputProps, TextStyle } from 'react-native';

import { useAppSelector } from '../../../hooks';
import { selectIsDarkTheme } from '../../../redux/selectors';

// Styles
import styles from './textInputStyles';

interface Props extends TextInputProps {
  innerRef: Ref<TextInput>;
  height: number;
  style: TextStyle;
}

const TextInputView = ({ innerRef, height, style, ...props }: Props) => {
  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  // Stable style prop: a new array/object literal on every render makes RN
  // ship a fresh style to the native UITextField each keystroke, which on iOS
  // can flicker the field's horizontal contentOffset.
  const mergedStyle = useMemo(() => [styles.input, { minHeight: height }, style], [height, style]);
  return (
    <TextInput
      ref={innerRef}
      keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
      textAlign={I18nManager.isRTL ? 'right' : 'left'}
      {...props}
      style={mergedStyle}
    />
  );
};

export default TextInputView;
