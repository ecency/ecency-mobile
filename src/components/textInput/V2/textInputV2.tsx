import React, { useEffect, useState } from 'react';
import { TextInput, TextInputProps, ViewStyle } from 'react-native';
import styles from '../../../screens/chat/components/chatsImport.style.tsx';

type ITextInputV2Value = string;

interface ITextInputV2 extends TextInputProps {
  value?: ITextInputV2Value;
  onChange: (value: ITextInputV2Value) => void;
}

export const TextInputV2 = ({
  onChange: parentOnChange,
  value: parentValue,
  ...rest
}: ITextInputV2) => {
  const [value, onChange] = useState<ITextInputV2Value>(parentValue || '');

  useEffect(() => {
    parentOnChange(value);
  }, [value]);

  return <TextInput {...rest} value={value} onChangeText={onChange} style={styles.input} />;
};
