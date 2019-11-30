import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, KeyboardAvoidingView, FlatList, Text, Platform, ScrollView } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { renderPostBody } from '@esteemapp/esteem-render-helpers';

// Utils
import Formats from './formats/formats';
import applyImageLink from './formats/applyWebLinkFormat';

// Components
import { IconButton } from '../../iconButton';
import { PostBody } from '../../postElements';
import { StickyBar } from '../../basicUIElements';
import { TextInput } from '../../textInput';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './markdownEditorStyles';

const MarkdownEditorView = ({
  draftBody,
  handleIsFormValid,
  handleOpenImagePicker,
  intl,
  isPreviewActive,
  isReply,
  isLoading,
  initialFields,
  onChange,
  handleOnTextChange,
  handleIsValid,
  componentID,
  uploadedImage,
}) => {
  const [text, setText] = useState(draftBody || '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [editable, setEditable] = useState(null);

  const inputRef = useRef(null);
  const galleryRef = useRef(null);
  const clearRef = useRef(null);

  useEffect(() => {
    if (!isPreviewActive) {
      _setTextAndSelection({ selection: { start: 0, end: 0 }, text });
    }
  }, [_setTextAndSelection, isPreviewActive, text]);

  useEffect(() => {
    if (text === '' && draftBody !== '') {
      _setTextAndSelection({ selection: { start: 0, end: 0 }, text: draftBody });
    }
  }, [_setTextAndSelection, draftBody, text]);

  useEffect(() => {
    if (editable === null) {
      // workaround for android context menu issue
      setEditable(false);
      setTimeout(() => {
        setEditable(!isLoading);
      }, 100);
    } else {
      setEditable(!isLoading);
    }
  }, [editable, isLoading]);

  useEffect(() => {
    if (uploadedImage && uploadedImage.url) {
      applyImageLink({
        text,
        selection,
        setTextAndSelection: _setTextAndSelection,
        item: { url: uploadedImage.url, text: uploadedImage.hash },
        isImage: !!uploadedImage,
      });
    }
  }, [_setTextAndSelection, selection, text, uploadedImage]);

  useEffect(() => {
    setText(draftBody);
  }, [draftBody]);

  useEffect(() => {
    const nextText = text.replace(text, '');

    if (nextText && nextText.length > 0) {
      _changeText(text);

      if (handleIsFormValid) {
        handleIsFormValid(text);
      }
    }
  }, [_changeText, handleIsFormValid, text]);

  const _changeText = useCallback(input => {
    setText(input);

    if (onChange) {
      onChange(input);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(input && input.length));
    }

    if (handleOnTextChange) {
      handleOnTextChange(input);
    }
  });

  const _handleOnSelectionChange = async event => {
    setSelection(event.nativeEvent.selection);
  };

  const _setTextAndSelection = useCallback(({ selection: _selection, text: _text }) => {
    inputRef.current.setNativeProps({
      text: _text,
    });
    // Workaround for iOS selection update issue
    setTimeout(() => {
      inputRef.current.setNativeProps({
        selection: _selection,
      });
      setSelection(_selection);
    }, 200);
    _changeText(_text);
  });

  const _renderPreview = () => (
    <ScrollView style={styles.previewContainer}>
      {text ? <PostBody body={renderPostBody(text)} /> : <Text>...</Text>}
    </ScrollView>
  );

  const _renderMarkupButton = ({ item }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() =>
          item.onPress({ text, selection, setTextAndSelection: _setTextAndSelection, item })
        }
      />
    </View>
  );

  const _renderEditorButtons = () => (
    <StickyBar>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={({ item, index }) => index !== 9 && _renderMarkupButton({ item })}
          horizontal
        />
      </View>
      <View style={styles.rightButtonsWrapper}>
        <IconButton
          size={20}
          style={styles.rightIcons}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="link"
          onPress={() =>
            Formats[9].onPress({ text, selection, setTextAndSelection: _setTextAndSelection })
          }
        />
        <IconButton
          onPress={() => galleryRef.current.show()}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="image"
        />
        <View style={styles.clearButtonWrapper}>
          <IconButton
            onPress={() => clearRef.current.show()}
            size={20}
            iconStyle={styles.clearIcon}
            iconType="FontAwesome"
            name="trash"
            backgroundColor={styles.clearButtonWrapper.backgroundColor}
          />
        </View>
      </View>
    </StickyBar>
  );

  const _handleClear = index => {
    if (index === 0) {
      initialFields();
      setText('');
      _setTextAndSelection({ text: '', selection: { start: 0, end: 0 } });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 25 })}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      {!isPreviewActive ? (
        <ThemeContainer>
          {({ isDarkTheme }) => (
            <TextInput
              multiline
              autoCorrect={false}
              onChangeText={_changeText}
              onSelectionChange={_handleOnSelectionChange}
              placeholder={intl.formatMessage({
                id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
              })}
              placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
              selectionColor="#357ce6"
              style={styles.textWrapper}
              underlineColorAndroid="transparent"
              innerRef={inputRef}
              editable={editable}
              contextMenuHidden={false}
            />
          )}
        </ThemeContainer>
      ) : (
          _renderPreview()
        )}
      {!isPreviewActive && _renderEditorButtons()}
      <ActionSheet
        ref={galleryRef}
        options={[
          intl.formatMessage({
            id: 'editor.open_gallery',
          }),
          intl.formatMessage({
            id: 'editor.capture_photo',
          }),
          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={2}
        onPress={index => {
          handleOpenImagePicker(index === 0 ? 'image' : index === 1 && 'camera');
        }}
      />
      <ActionSheet
        ref={clearRef}
        title={intl.formatMessage({
          id: 'alert.clear_alert',
        })}
        options={[
          intl.formatMessage({
            id: 'alert.clear',
          }),
          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={1}
        onPress={_handleClear}
      />
    </KeyboardAvoidingView>
  );
};

export default MarkdownEditorView;
