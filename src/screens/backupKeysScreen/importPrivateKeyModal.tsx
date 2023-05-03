import { View, Text, TouchableOpacity } from 'react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, TextInput } from '../../components';

// styles
import styles from './backupKeysScreenStyles';
import EStyleSheet from 'react-native-extended-stylesheet';

type Props = {};

export const ImportPrivateKeyModalModal = forwardRef(({}: Props, ref) => {
  const intl = useIntl();
  const [showModal, setShowModal] = useState(false);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setShowModal(true);
    },
  }));

  const _renderContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalDescText}>
        {intl.formatMessage({
          id: 'settings.backup_keys_modal.import_key_modal_desc',
        })}
      </Text>
      <View style={styles.signInputContainer}>
        <TextInput
          placeholder={intl.formatMessage({
            id: 'settings.backup_keys_modal.sign_input_placeholder',
          })}
          placeholderTextColor={EStyleSheet.value('$borderColor')}
          style={styles.signInput}
        />
        <TouchableOpacity style={styles.signBtn}>
          <Text style={styles.signBtnText}>
            {intl.formatMessage({ id: 'settings.backup_keys_modal.sign' })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      isOpen={showModal}
      handleOnModalClose={() => {
        setShowModal(false);
      }}
      isCloseButton
      title={intl.formatMessage({ id: 'settings.backup_keys_modal.enter_pass' })}
      animationType="slide"
      style={{}}
      isTransparent
      hasBackdrop
      backdropOpacity={0.7}
      modalHeaderContainerStyle={styles.modalHeaderContainerStyle}
      modalHeaderTitleStyle={styles.modalHeaderTitleStyle}
      modalCloseBtnStyle={styles.modalCloseBtnStyle}
    >
      {_renderContent()}
    </Modal>
  );
});
