import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Platform, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MainButton, PostBody, TextButton } from '..';
import styles from './insertLinkModalStyles';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import TextInput from '../textInput';
import { delay } from '../../utils/editor';
import { isStringWebLink } from '../markdownEditor/view/formats/utils';
import { renderPostBody } from '@ecency/render-helper';
import { ScrollView } from 'react-native-gesture-handler';
import applyWebLinkFormat from '../markdownEditor/view/formats/applyWebLinkFormat';

interface InsertLinkModalProps {
  handleOnInsertLink: ({
    snippetText,
    selection,
  }: {
    snippetText: string;
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
    const [formattedText, setFormattedText] = useState('');
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [selectedUrlType, setSelectedUrlType] = useState(0);
    const [previewBody, setPreviewBody] = useState('');
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
      handleOnInsertLink({ snippetText: formattedText, selection: selection });
      setIsUrlValid(true);
    };

    const _setFormattedTextAndSelection = ({ selection, text }) => {
      setPreviewBody(renderPostBody(text, true, Platform.OS === 'ios' ? false : true));
      setFormattedText(text);
    };

    useEffect(() => {
      if (!label) {
        // hack for updating the preview when label is deleted
        _handleUrlChange(url);
      }
    }, [label]);

    const _handleLabelChange = (text) => {
      setLabel(text);

      if (text && isStringWebLink(url)) {
        setIsLoading(true);
        applyWebLinkFormat({
          item: { text: text, url: url },
          text: '',
          selection: { start: 0, end: 0 },
          setTextAndSelection: _setFormattedTextAndSelection,
          isImage: selectedUrlType === 2,
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    const _handleUrlChange = (text) => {
      const labelText = selectedUrlType === 2 ? 'image' : label; //TODO: replace image label here. Using demo label for now
      setUrl(text);
      if (isStringWebLink(text)) {
        setIsLoading(true);
        setIsUrlValid(true);
        applyWebLinkFormat({
          item: { text: labelText, url: text },
          text: '',
          selection: { start: 0, end: 0 },
          setTextAndSelection: _setFormattedTextAndSelection,
          isImage: selectedUrlType === 2,
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setPreviewBody('');
      }
    };

    const _handleOnCloseSheet = () => {
      labelInputRef.current?.blur();
      setLabel('');
      setUrl('');
      setSelectedUrlType(0);
      setPreviewBody('');
      setIsUrlValid(true);
      setSelectedText('');
      setFormattedText('');
      handleOnSheetClose();
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
          onChangeText={_handleLabelChange}
          placeholder={'Enter Label (Optional)'}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          innerRef={labelInputRef}
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
          onChangeText={_handleUrlChange}
          placeholder={'Enter URL'}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          keyboardType="url"
          innerRef={urlInputRef}
        />
        {!isUrlValid && <Text style={styles.validText}>Please insert valid url</Text>}
      </View>
    );
    const _renderPreview = () => {
      return (
        <>
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>Preview</Text>
            {previewBody ? (
              <View style={styles.preview}>
                <PostBody body={previewBody} onLoadEnd={() => setIsLoading(false)} />
              </View>
            ) : null}
            {isLoading && <ActivityIndicator color={'$primaryBlue'} />}
          </View>
        </>
      );
    };
    const _renderContent = (
      <ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
        {_renderInputs()}
        {_renderPreview()}
        {_renderFloatingPanel()}
      </ScrollView>
    );

    return (
      <ActionSheet
        ref={sheetModalRef}
        gestureEnabled={true}
        keyboardShouldPersistTaps="handled"
        containerStyle={styles.sheetContent}
        keyboardHandlerEnabled
        indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
        onClose={_handleOnCloseSheet}
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
