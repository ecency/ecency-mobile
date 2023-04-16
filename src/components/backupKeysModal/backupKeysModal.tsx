import React from 'react';
import { useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';
import styles from './backupKeysModalStyles';
import Modal from '../modal';
import { TextInputWithCopy } from '..';

interface BackupPrivateKeysModalProps {
  visible: boolean;
  handleBackupKeysModalVisibility: (value: boolean) => void;
}

export const BackupPrivateKeysModal = ({
  visible,
  handleBackupKeysModalVisibility,
}: BackupPrivateKeysModalProps) => {
  const intl = useIntl();

  const _handleOnCloseSheet = () => {
    handleBackupKeysModalVisibility(false);
  };

  const _renderInputs = () => (
    <View style={styles.inputsContainer}>
      <TextInputWithCopy
        label={intl.formatMessage({
          id: 'settings.backup_keys_modal.owner_key',
        })}
        value={'text'}
      />
    </View>
  );

  const _renderContent = (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {_renderInputs()}
    </ScrollView>
  );

  return (
    <Modal
      isOpen={visible}
      handleOnModalClose={_handleOnCloseSheet}
      presentationStyle="formSheet"
      animationType="slide"
      title={intl.formatMessage({ id: 'settings.backup_private_keys' })}
      style={styles.modalStyle}
    >
      {_renderContent}
    </Modal>
  );
};
