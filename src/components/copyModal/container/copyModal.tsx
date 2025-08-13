import React, { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { TextInput } from 'react-native';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';
import { useIntl } from 'react-intl';
import { MainButton } from '../../mainButton';
import styles from '../styles/copyModal.styles';

export type CopyModalHandle = {
  show: (selectedText: string) => void;
};

const CopyModalInner = (_: object, ref: React.Ref<CopyModalHandle>) => {
  const intl = useIntl();
  const inputRef = useRef<TextInput>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState('');

  useImperativeHandle(ref, () => ({
    show: (selectedText) => {
      setIsVisible(true);
      setText(selectedText);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    },
  }));

  const _onClose = () => {
    setIsVisible(false);
    setText('');
  };

  return (
    <Popover
      popoverStyle={styles.modal}
      arrowSize={{ width: 0, height: 0 }}
      isVisible={isVisible}
      onRequestClose={_onClose}
      backgroundStyle={{ flex: 1 }}
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
        onPress={_onClose}
        text={intl.formatMessage({ id: 'alert.close' })}
      />
    </Popover>
  );
};

export const CopyModal = forwardRef(CopyModalInner);
