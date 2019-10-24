import React, { useState, useRef, useEffect } from 'react';
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

  const [newSelection, setNewSelection] = useState(null);

  const inputRef = useRef(null);
  const galleryRef = useRef(null);
  const clearRef = useRef(null);

  useEffect(() => {
    setSelection({ start: 0, end: 0 });
  }, [isPreviewActive]);

  useEffect(() => {
    if (uploadedImage && uploadedImage.url) {
      applyImageLink({
        text,
        selection,
        setText,
        setNewSelection,
        item: { url: uploadedImage.url, text: uploadedImage.hash },
        isImage: !!uploadedImage,
      });
    }
  }, [uploadedImage]);

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
  }, [text]);

  const _changeText = input => {
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
  };

  const _handleOnSelectionChange = event => {
    if (newSelection) {
      setSelection(newSelection);
      setNewSelection(null);
      return;
    }
    setSelection(event.nativeEvent.selection);
  };

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
        onPress={() => item.onPress({ text, selection, setText, setNewSelection, item })}
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
          onPress={() => Formats[9].onPress({ text, selection, setText, setNewSelection })}
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
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 25 })}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      {!isPreviewActive ? (
        <TextInput
          multiline
          onChangeText={_changeText}
          onSelectionChange={_handleOnSelectionChange}
          placeholder={intl.formatMessage({
            id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
          })}
          placeholderTextColor="#c1c5c7"
          selection={selection}
          selectionColor="#357ce6"
          style={styles.textWrapper}
          underlineColorAndroid="transparent"
          value={text}
          innerRef={inputRef}
          editable={!isLoading}
        />
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
// class MarkdownEditorView extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       text: props.draftBody || '',
//       selection: { start: 0, end: 0 },
//       textUpdated: false,
//       newSelection: null,
//     };

//     this.inputRef = React.createRef();
//     this.galleryRef = React.createRef();
//     this.clearRef = React.createRef();
//   }

//   // Lifecycle functions
//   UNSAFE_componentWillReceiveProps(nextProps) {
//     const { draftBody, uploadedImage, isPreviewActive } = this.props;
//     if (!nextProps.isPreviewActive && isPreviewActive) {
//       this.setState({
//         selection: { start: 0, end: 0 },
//       });
//     }
//     if (nextProps.draftBody && draftBody !== nextProps.draftBody) {
//       this.setState({
//         text: nextProps.draftBody,
//       });
//     }

//     if (
//       nextProps.uploadedImage &&
//       nextProps.uploadedImage.url &&
//       nextProps.uploadedImage !== uploadedImage
//     ) {
//       applyImageLink({
//         getState: this._getState,
//         setState: async (state, callback) => {
//           await this.setState(state, callback);
//         },
//         item: { url: nextProps.uploadedImage.url, text: nextProps.uploadedImage.hash },
//         isImage: !!nextProps.uploadedImage,
//       });
//     }
//   }

//   componentDidUpdate(prevProps, prevState) {
//     const { text } = this.state;
//     const { handleIsFormValid } = this.props;

//     if (prevState.text !== text) {
//       const nextText = text.replace(prevState.text, '');

//       if (nextText && nextText.length > 0) {
//         this._changeText(text);

//         if (handleIsFormValid) {
//           handleIsFormValid(text);
//         }
//       }
//     }
//   }

//   // Component functions

// }
