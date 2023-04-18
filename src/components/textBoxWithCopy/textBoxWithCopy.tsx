import React from 'react';
import { useIntl } from 'react-intl';
import { View, Text } from 'react-native';
import IconButton from '../iconButton';
import Clipboard from '@react-native-clipboard/clipboard';

// Styles
import styles from './textBoxWithCopyStyles';
import { useDispatch } from 'react-redux';
import { toastNotification } from '../../redux/actions/uiAction';

interface TextBoxWithCopyProps {
  label: string;
  value: string;
}

const TextBoxWithCopy = ({ label, value }: TextBoxWithCopyProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.copyInputContainer}>
        <View style={styles.textValueContainer}>
          <Text style={styles.textValue} numberOfLines={1} selectable>
            {value}
          </Text>
        </View>
        <IconButton
          size={20}
          color={'white'}
          style={styles.copyIconStyle}
          name="content-copy"
          iconType="MaterialIcons"
          onPress={() => {
            Clipboard.setString(value);
            dispatch(
              toastNotification(
                intl.formatMessage({ id: 'settings.backup_keys_modal.key_copied' }),
              ),
            );
          }}
        />
      </View>
    </View>
  );
};

export default TextBoxWithCopy;
