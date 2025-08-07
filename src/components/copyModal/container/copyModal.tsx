import React, { useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';
import { useIntl } from 'react-intl';
import { MainButton } from '../../mainButton';

import styles from '../styles/copyModal.styles';

export const CopyModal = ({
  visible,
  onClose,
  text,
  sourceRef,
}: {
  visible: boolean;
  onClose: () => void;
  text: string;
}) => {
  const inputRef = useRef<TextInput>(null);
  const intl = useIntl();

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [visible, text]);

  return (
    <Popover
      popoverStyle={styles.modal}
      arrowSize={{ width: 0, height: 0 }}
      isVisible={visible}
      onRequestClose={onClose}
      backgroundStyle={{ flex: 1 }}
      from={sourceRef}
      placement={[Placement.CENTER]}
      offset={12}
    >
      <TextInput
        ref={inputRef}
        style={styles.textInput}
        value={text}
        multiline
        editable={true}
        selectTextOnFocus={true}
        scrollEnabled={true}
        showSoftInputOnFocus={false}
      />
      <MainButton
        style={styles.button}
        textStyle={styles.buttonText}
        onPress={onClose}
        text={intl.formatMessage({ id: 'alert.close' })}
      />
    </Popover>
  );
};
