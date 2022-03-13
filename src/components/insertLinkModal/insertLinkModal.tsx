import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import { MainButton, TextButton } from '..';
import styles from './insertLinkModalStyles';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import TextInput from '../textInput';
import { delay } from '../../utils/editor';

interface InsertLinkModalProps {
  handleOnInsertLink: ({ label, url }: { label: string; url: string }) => void;
  handleOnSheetClose: () => void;
}

export const InsertLinkModal = forwardRef(
  ({ handleOnInsertLink, handleOnSheetClose }: InsertLinkModalProps, ref) => {
    const intl = useIntl();

    const [isLoading, setIsLoading] = useState(false);
    const [label, setLabel] = useState('');
    const [url, setUrl] = useState('');
    const sheetModalRef = useRef<ActionSheet>();
    const labelInputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      showModal: async() => {
        sheetModalRef.current?.setModalVisible(true);
        await delay(1500);
        labelInputRef.current?.focus()
      },
      hideModal: () => {
        sheetModalRef.current?.setModalVisible(false);
      },
    }));

    //renders footer with add snipept button and shows new snippet modal
    const _renderFloatingPanel = () => {
      return (
        <View style={styles.floatingContainer}>
          <TextButton
            style={styles.cancelButton}
            onPress={() => sheetModalRef.current?.setModalVisible(false)}
            text={'Cancel'}
          />
          <MainButton
            style={styles.insertBtn}
            onPress={() => handleOnInsertLink({ label, url })}
            iconName="plus"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text={'Insert Link'}
          />
        </View>
      );
    };

    const _renderInputs = () => (
      <View style={styles.inputsContainer}>
        <Text style={styles.inputLabel}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder={'Enter Label'}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          innerRef={labelInputRef}
        />
        <Text style={styles.inputLabel}>URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder={'Enter URL'}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
        />
      </View>
    );
    const _renderContent = (
      <View style={styles.container}>
        {_renderInputs()}
        {_renderFloatingPanel()}
      </View>
    );

    return (
      <ActionSheet
        ref={sheetModalRef}
        gestureEnabled={true}
        keyboardShouldPersistTaps="handled"
        containerStyle={styles.sheetContent}
        keyboardHandlerEnabled
        indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
        onClose={() => {
          labelInputRef.current?.blur();
          setLabel('');
          setUrl('');
          handleOnSheetClose();
        }}
      >
        {_renderContent}
      </ActionSheet>
    );
  },
);
