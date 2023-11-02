import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Modal, TextInput } from '../../components';
import { useAppSelector } from '../../hooks';

// styles
import styles from './backupKeysScreenStyles';

// redux / providers
import { getUpdatedUserKeys } from '../../providers/hive/auth';
import { getDigitPinCode } from '../../providers/hive/dhive';
import { updateCurrentAccount } from '../../redux/actions/accountAction';

export const ImportPrivateKeyModalModal = forwardRef(({}, ref) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const digitPinCode = getDigitPinCode(pinCode);

  const [showModal, setShowModal] = useState(false);
  const [key, setKey] = useState('');

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setShowModal(true);
    },
  }));

  //  sign key with password or master key
  const _handleSignKey = async () => {
    const data = {
      username: currentAccount.username,
      password: key,
      pinCode: digitPinCode,
    };

    getUpdatedUserKeys(currentAccount, data)
      .then((result) => {
        if (result) {
          // Save user data to Realm DB
          // await setUserData(updatedUserData);
          // update user data in redux
          dispatch(updateCurrentAccount({ ...result }));
          setShowModal(false);
        }
      })
      .catch((err) => {
        // if error description exist, pass it to alert else pass error message key
        const errorDescription = err?.response?.data?.error_description
          ? err?.response?.data?.error_description
          : intl.formatMessage({
              id: err.message,
            });
        Alert.alert(
          intl.formatMessage({
            id: 'settings.backup_keys_modal.import_failed',
          }),
          ` ${errorDescription}\n${intl.formatMessage({ id: 'login.login_failed_body' })}`, // append login body failure key
        );
      });
  };

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
          onChangeText={setKey}
          secureTextEntry
        />
        <TouchableOpacity style={styles.signBtn} onPress={_handleSignKey}>
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
