import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import { MainButton, TextButton } from '..';
import styles from './insertLinkModalStyles';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import TextInput from '../textInput';
import { delay } from '../../utils/editor';
import { isStringWebLink } from '../markdownEditor/view/formats/utils';

interface InsertLinkModalProps {
  handleOnInsertLink: ({
    label,
    url,
    selection,
  }: {
    label: string;
    url: string;
    selection: { start: number; end: number };
  }) => void;
  handleOnSheetClose: () => void;
}

export const InsertLinkModal = forwardRef(
  ({ handleOnInsertLink, handleOnSheetClose }: InsertLinkModalProps, ref) => {
    const intl = useIntl();

    const [isLoading, setIsLoading] = useState(false);
    const [label, setLabel] = useState('');
    const [url, setUrl] = useState('');
    const [isUrlValid, setIsUrlValid] = useState(true);
    const [selectedText, setSelectedText] = useState('');
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [selectedUrlType, setSelectedUrlType] = useState(0);
    const sheetModalRef = useRef<ActionSheet>();
    const labelInputRef = useRef(null);
    const urlInputRef = useRef(null);
    useImperativeHandle(ref, () => ({
      showModal: async ({ selectedText, selection }) => {
        setSelectedText(selectedText);
        setSelection(selection);
        if (selection && selection.start !== selection.end) {
          if (isStringWebLink(selectedText)) {
            setUrl(selectedText);
          } else {
            setLabel(selectedText);
          }
        }
        sheetModalRef.current?.setModalVisible(true);
        await delay(1500);
        labelInputRef.current?.focus();
      },
      hideModal: () => {
        sheetModalRef.current?.setModalVisible(false);
      },
    }));

    const _handleInsert = () => {
      if (!isStringWebLink(url)) {
        setIsUrlValid(false);
        return;
      }
      handleOnInsertLink({ label, url, selection });
    };

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
            onPress={() => _handleInsert()}
            iconName="plus"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text={'Insert Link'}
          />
        </View>
      );
    };

    const LinkTypeOptions = URL_TYPES.map((item) => {
      const selected = item.id === selectedUrlType;
      return (
        <TouchableOpacity
          onPress={() => {
            setSelectedUrlType(item.id);
            if (item.id === 0) {
              urlInputRef.current?.blur();
              labelInputRef.current?.focus();
            } else {
              labelInputRef.current?.blur();
              urlInputRef.current?.focus();
            }
          }}
          style={selected ? styles.optionBtnSelected : styles.optionBtn}
        >
          <Text style={selected ? styles.optionBtnTextSelected : styles.optionBtnText}>
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    });

    const _renderLabelInput = () => (
      <>
        <Text style={styles.inputLabel}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder={'Enter Label'}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          innerRef={labelInputRef}
          autoFocus
        />
      </>
    );
    const _renderInputs = () => (
      <View style={styles.inputsContainer}>
        <Text style={styles.inputLabel}>Type of Link</Text>
        <View style={styles.optionsRow}>{LinkTypeOptions}</View>
        {selectedUrlType === 0 && _renderLabelInput()}
        <Text style={styles.inputLabel}>URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder={'Enter URL'}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          keyboardType="url"
          innerRef={urlInputRef}
        />
        {!isUrlValid && <Text style={styles.validText}>Please insert valid url</Text>}
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

const URL_TYPES = [
  {
    id: 0,
    title: 'plain',
  },
  {
    id: 1,
    title: 'video',
  },
  {
    id: 2,
    title: 'image',
  },
];
