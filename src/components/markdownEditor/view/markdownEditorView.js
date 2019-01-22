import React, { Component } from 'react';
import {
  View, KeyboardAvoidingView, FlatList, Text, Platform, ScrollView,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';

// Utils
import { markDown2Html } from '../../../utils/markdownToHtml';
import applyImageLink from './formats/applyWebLinkFormat';
import Formats from './formats/formats';

// Components
import { IconButton } from '../../iconButton';
import { PostBody } from '../../postElements';
import { StickyBar } from '../../basicUIElements';
import { TextInput } from '../../textInput';

// Styles
import styles from './markdownEditorStyles';

export default class MarkdownEditorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.draftBody || '',
      selection: { start: 0, end: 0 },
    };
  }

  // Lifecycle functions
  componentWillReceiveProps(nextProps) {
    const { draftBody, uploadedImage, isPreviewActive } = this.props;
    if (!nextProps.isPreviewActive && isPreviewActive) {
      this.setState({
        selection: { start: 0, end: 0 },
      });
    }
    if (nextProps.draftBody && draftBody !== nextProps.draftBody) {
      this.setState({
        text: nextProps.draftBody,
      });
    }

    if (
      nextProps.uploadedImage
      && nextProps.uploadedImage.url
      && nextProps.uploadedImage !== uploadedImage
    ) {
      applyImageLink({
        getState: this._getState,
        setState: (state, callback) => {
          this.setState(state, callback);
        },
        item: { url: nextProps.uploadedImage.url, text: nextProps.uploadedImage.hash },
        isImage: !!nextProps.uploadedImage,
      });
    }
  }

  // Component functions
  _changeText = (input) => {
    const {
      onChange, handleOnTextChange, handleIsValid, componentID,
    } = this.props;

    this.setState({ text: input });

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

  _handleOnSelectionChange = (event) => {
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  _getState = () => {
    this.setState({
      selection: {
        start: 1,
        end: 1,
      },
    });
    return this.state;
  };

  _renderPreview = () => {
    const { text } = this.state;

    return (
      <ScrollView style={styles.previewContainer}>
        {text ? <PostBody body={markDown2Html(text)} /> : <Text>...</Text>}
      </ScrollView>
    );
  };

  _renderMarkupButton = ({ item, getState, setState }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() => item.onPress({ getState, setState, item })}
      />
    </View>
  );

  _renderEditorButtons = ({ getState, setState }) => (
    <StickyBar>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={
            ({ item, index }) => index !== 9
            && this._renderMarkupButton({ item, getState, setState })
          }
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
          onPress={() => Formats[9].onPress({ getState, setState })}
        />
        <IconButton
          onPress={() => this.ActionSheet.show()}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="image"
        />
        {/* TODO: After alpha */}
        {/* <DropdownButton
          style={styles.dropdownStyle}
          options={['option1', 'option2', 'option3', 'option4']}
          iconName="md-more"
          iconStyle={styles.dropdownIconStyle}
          isHasChildIcon
        /> */}
      </View>
    </StickyBar>
  );

  render() {
    const {
      intl, isPreviewActive, isReply, handleOpenImagePicker,
    } = this.props;
    const { text, selection } = this.state;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 25 })}
        behavior={(Platform.OS === 'ios') ? 'padding' : null}
      >
        {!isPreviewActive ? (
          <TextInput
            multiline
            onChangeText={e => this._changeText(e)}
            onSelectionChange={this._handleOnSelectionChange}
            placeholder={intl.formatMessage({
              id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
            })}
            placeholderTextColor="#c1c5c7"
            selection={Platform.OS === 'ios' ? selection : undefined}
            selectionColor="#357ce6"
            style={styles.textWrapper}
            underlineColorAndroid="transparent"
            value={text}
            {...this.props}
          />
        ) : (
          this._renderPreview()
        )}
        {!isPreviewActive
          && this._renderEditorButtons({
            getState: this._getState,
            setState: (state, callback) => {
              this.setState(state, callback);
            },
          })}
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={['Open Gallery', 'Capture a photo', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => {
            handleOpenImagePicker(index === 0 ? 'image' : index === 1 && 'camera');
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}
