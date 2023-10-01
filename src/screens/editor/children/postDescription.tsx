import React from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import { TextInput } from '../../../components';

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

  return (
    <View style={styles.thumbSelectContainer}>
      <Text style={styles.settingLabel}>{intl.formatMessage({ id: 'editor.short_desc' })}</Text>
      <TextInput
        style={styles.input}
        value={postDescription}
        onChangeText={handlePostDescriptionChange}
        autoCapitalize="none"
        maxLength={255}
        editable
        multiline
      />
    </View>
  );
};

export default PostDescription;
