import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
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
const previewWidth = Dimensions.get('window').width - 64;

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

    useEffect(() => {
      if (isStringWebLink(url)) {
        setIsUrlValid(true);
      }
      if (url) {
        const labelText =
          selectedUrlType === 2 ? 'dummy-label' : selectedUrlType === 1 ? '' : label; //TODO: replace image label here. Using demo label for now
        applyWebLinkFormat({
          item: { text: labelText, url: url },
          text: '',
          selection: { start: 0, end: 0 },
          setTextAndSelection: _setFormattedTextAndSelection,
          isImage: selectedUrlType === 2,
          isVideo: selectedUrlType === 1,
        });
      } else {
        setPreviewBody('');
      }
    }, [label, url, selectedUrlType]);

    const _setFormattedTextAndSelection = ({ selection, text }) => {
      setPreviewBody(renderPostBody(text, true, Platform.OS === 'ios' ? false : true));
      setFormattedText(text);
    };

    const _handleLabelChange = (text) => {
      setLabel(text);
    };
    const _handleUrlChange = (text) => {
      setUrl(text);
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

    const _handleInsert = () => {
      if (!isStringWebLink(url)) {
        setIsUrlValid(false);
        return;
      }
      handleOnInsertLink({ snippetText: formattedText, selection: selection });
      setIsUrlValid(true);
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

    const URL_TYPES = [
      {
        id: 0,
        title: intl.formatMessage({
          id: 'editor.plain',
        }),
      },
      {
        id: 1,
        title: intl.formatMessage({
          id: 'editor.video',
        }),
      },
      {
        id: 2,
        title: intl.formatMessage({
          id: 'editor.image',
        }),
      },
    ];
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
        <Text style={styles.inputLabel}>
          {intl.formatMessage({
            id: 'editor.label',
          })}
        </Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={_handleLabelChange}
          placeholder={intl.formatMessage({
            id: 'editor.enter_label_placeholder',
          })}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          innerRef={labelInputRef}
        />
      </>
    );
    const _renderInputs = () => (
      <View style={styles.inputsContainer}>
        <Text style={styles.inputLabel}>
          {intl.formatMessage({
            id: 'editor.link_type_text',
          })}
        </Text>
        <View style={styles.optionsRow}>{LinkTypeOptions}</View>
        {selectedUrlType === 0 && _renderLabelInput()}
        <Text style={styles.inputLabel}>
          {intl.formatMessage({
            id: 'editor.url',
          })}
        </Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={_handleUrlChange}
          placeholder={intl.formatMessage({
            id: 'editor.enter_url_placeholder',
          })}
          placeholderTextColor="#c1c5c7"
          autoCapitalize="none"
          keyboardType="url"
          innerRef={urlInputRef}
        />
        {!isUrlValid && (
          <Text style={styles.validText}>
            {intl.formatMessage({
              id: 'editor.invalid_url_error',
            })}
          </Text>
        )}
      </View>
    );
    const _renderPreview = () => {
      return (
        <>
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>
              {intl.formatMessage({
                id: 'editor.preview',
              })}
            </Text>
            <View style={styles.previewWrapper}>
              <View style={styles.preview}>
                {previewBody ? (
                  <PostBody
                    body={previewBody}
                    onLoadEnd={() => setIsLoading(false)}
                    width={previewWidth}
                  />
                ) : null}
              </View>
            </View>
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
