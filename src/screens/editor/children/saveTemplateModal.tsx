import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, View } from 'react-native';
import { Modal, TextInput } from '../../../components';
import { TextButton } from '../../../components/buttons';
import { useAppSelector } from '../../../hooks';
import { selectIsDarkTheme } from '../../../redux/selectors';
import styles from './saveTemplateModalStyles';

export interface SaveTemplateModalRef {
  show: () => void;
}

interface SaveTemplateModalProps {
  onSave: (templateName: string) => void;
}

// Small name prompt for saving the current post as a template; follows the
// snippetEditorModal pattern (Modal + TextInput + TextButton action panel).
const SaveTemplateModal = ({ onSave }: SaveTemplateModalProps, ref) => {
  const intl = useIntl();
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const [templateName, setTemplateName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useImperativeHandle(ref, () => ({
    show: () => {
      setTemplateName('');
      setShowModal(true);
    },
  }));

  const _onSavePress = () => {
    const name = templateName.trim();
    if (!name) {
      Alert.alert(intl.formatMessage({ id: 'alert.can_not_be_empty' }));
      return;
    }
    setShowModal(false);
    onSave(name);
  };

  return (
    <Modal
      isOpen={showModal}
      handleOnModalClose={() => {
        setShowModal(false);
      }}
      presentationStyle="formSheet"
      title={intl.formatMessage({ id: 'templates.save_as_template' })}
      animationType="slide"
      style={styles.modalStyle}
    >
      <View style={styles.container}>
        <TextInput
          autoFocus={true}
          style={styles.nameInput}
          placeholder={intl.formatMessage({ id: 'templates.name_placeholder' })}
          placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
          maxLength={255}
          onChangeText={setTemplateName}
          value={templateName}
        />
        <View style={styles.actionPanel}>
          <TextButton
            text={intl.formatMessage({ id: 'snippets.btn_cancel' })}
            onPress={() => setShowModal(false)}
            style={styles.closeButton}
          />
          <TextButton
            text={intl.formatMessage({ id: 'snippets.btn_save' })}
            onPress={_onSavePress}
            textStyle={styles.btnText}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
};

export default forwardRef(SaveTemplateModal);
