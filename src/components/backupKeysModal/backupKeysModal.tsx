import React from 'react';
import { useIntl } from 'react-intl';
import { ScrollView, View, Text } from 'react-native';
import styles from './backupKeysModalStyles';
import Modal from '../modal';
import { TextBoxWithCopy } from '..';
import { useAppSelector } from '../../hooks';
import AUTH_TYPE from '../../constants/authType';

interface BackupPrivateKeysModalProps {
  visible: boolean;
  handleBackupKeysModalVisibility: (value: boolean) => void;
}

export const BackupPrivateKeysModal = ({
  visible,
  handleBackupKeysModalVisibility,
}: BackupPrivateKeysModalProps) => {
  const intl = useIntl();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const _handleOnCloseSheet = () => {
    handleBackupKeysModalVisibility(false);
  };

  const _renderKey = (authType: string, key: string) => (
    <View style={styles.inputsContainer}>
      <TextBoxWithCopy label={authType} value={key} />
    </View>
  );

  const _renderNoKeys = () => (
    <View style={styles.noKeysContainer}>
      <Text style={styles.noKeysText}>
        {intl.formatMessage({
          id: 'settings.backup_keys_modal.no_keys',
        })}
      </Text>
    </View>
  );
  const _renderContent = (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {currentAccount?.local?.authType === AUTH_TYPE.STEEM_CONNECT && _renderNoKeys()}
      {currentAccount?.local?.masterKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.owner_key',
            }),
            currentAccount?.local?.masterKey || '',
          )
        : null}
      {currentAccount?.local?.activeKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.active_key',
            }),
            currentAccount?.local?.activeKey || '',
          )
        : null}
      {currentAccount?.local?.postingKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.posting_key',
            }),
            currentAccount?.local?.postingKey || '',
          )
        : null}
      {currentAccount?.local?.memoKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.memo_key',
            }),
            currentAccount?.local?.memoKey || '',
          )
        : null}
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
