import React from 'react';
import { useIntl } from 'react-intl';
import { Platform, Text, View } from 'react-native';
import { TextInput } from '../../../components';
import { useUncontrolledInput } from '../../../hooks';

import styles from './styles';

interface PostDescriptionProps {
  postDescription: string;
  handlePostDescriptionChange: (value: string) => void;
}

const PostDescription = ({
  postDescription,
  handlePostDescriptionChange,
}: PostDescriptionProps) => {
  const intl = useIntl();
  const { inputProps } = useUncontrolledInput(postDescription, handlePostDescriptionChange);

  return (
    <View style={styles.thumbSelectContainer}>
      <Text style={styles.settingLabel}>{intl.formatMessage({ id: 'editor.short_desc' })}</Text>
      <TextInput
        style={styles.input}
        innerRef={inputProps.ref}
        defaultValue={inputProps.defaultValue}
        onChangeText={inputProps.onChangeText}
        onFocus={inputProps.onFocus}
        onBlur={inputProps.onBlur}
        autoCapitalize="none"
        autoCorrect={Platform.OS === 'ios'}
        autoComplete={Platform.OS === 'ios' ? undefined : 'off'}
        spellCheck={Platform.OS === 'ios'}
        maxLength={255}
        placeholder={intl.formatMessage({ id: 'editor.short_desc_placeholder' })}
        editable
        multiline
      />
    </View>
  );
};

export default PostDescription;
