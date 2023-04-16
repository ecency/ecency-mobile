import React from 'react';
import { useIntl } from 'react-intl';
import { TextInput, View, Text } from 'react-native';
import IconButton from '../iconButton';

// Styles
import styles from './textInputWithCopyStyles';

interface TextInputWithCopyProps {
  label: string;
  value: string;
}

const TextInputWithCopy = ({ label, value }: TextInputWithCopyProps) => {
  const intl = useIntl();

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.copyInputContainer}>
        <TextInput style={styles.input} value={value} autoCapitalize="none" editable={false} />
        <IconButton
          size={20}
          color={'white'}
          style={styles.copyIconStyle}
          name="content-copy"
          iconType="MaterialIcons"
        />
      </View>
    </View>
  );
};

export default TextInputWithCopy;
