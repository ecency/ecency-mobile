import React from 'react';
import { useIntl } from 'react-intl';
import { View, Text } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useDispatch } from 'react-redux';
import IconButton from '../iconButton';

// Styles
import styles from './textBoxWithCopyStyles';
import { toastNotification } from '../../redux/actions/uiAction';

interface TextBoxWithCopyProps {
  label: string;
  value: string;
  renderSecondButton?: any;
}

const TextBoxWithCopy = ({ label, value, renderSecondButton }: TextBoxWithCopyProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {renderSecondButton || null}
      </View>
      <View style={styles.copyInputContainer}>
        <View style={styles.textValueContainer}>
          <Text style={styles.textValue} numberOfLines={1} selectable>
            {value}
          </Text>
        </View>
        <IconButton
          size={20}
          color="white"
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
