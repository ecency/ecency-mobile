import React, { Component } from 'react';
import {
  View, TextInput, KeyboardAvoidingView, ScrollView, FlatList,
} from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';

// Components
import Formats from './formats/formats';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';

// Styles
import styles from './markdownEditorStyles';
import previewStyles from './markdownPreviewStyles';

export default class MarkdownEditorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      selection: { start: 0, end: 0 },
    };
  }

  componentDidMount() {
    this.textInput.focus();
  }

  changeText = (input) => {
    const { handleOnTextChange } = this.props;

    this.setState({ text: input });

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
      <View style={styles.textWrapper}>
        <ScrollView removeClippedSubviews>
          <MarkdownView styles={previewStyles}>{text === '' ? '...' : text}</MarkdownView>
        </ScrollView>
      </View>
    );
  };

  _renderMarkupButton = ({ item, getState, setState }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconType={item.iconType}
        name={item.icon}
        onPress={() => item.onPress({ getState, setState, item })}
      />
    </View>
  );

  _renderEditorButtons = ({ getState, setState }) => (
    <View style={styles.editorButtons}>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          // keyboardShouldPersistTaps="always"
          renderItem={({ item }) => this._renderMarkupButton({ item, getState, setState })}
          horizontal
        />
      </View>
      <View style={styles.rightButtonsWrapper}>
        <IconButton
          size={20}
          style={styles.rightIcons}
          iconType="Feather"
          name="link-2"
          onPress={() => Formats[9].onPress({ getState, setState })}
        />
        <IconButton style={styles.rightIcons} size={20} iconType="Feather" name="image" />
        <DropdownButton
          style={styles.dropdownStyle}
          options={['option1', 'option2', 'option3', 'option4']}
          iconName="md-more"
          iconStyle={styles.dropdownIconStyle}
          isHasChildIcon
        />
      </View>
    </View>
  );

  render() {
    const { isPreviewActive } = this.props;
    const { text, selection } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {!isPreviewActive ? (
          <TextInput
            multiline
            onChangeText={this.changeText}
            onSelectionChange={this._handleOnSelectionChange}
            placeHolder="What would you like to write about today?"
            placeholderTextColor="#c1c5c7"
            ref={textInput => (this.textInput = textInput)}
            selection={selection}
            selectionColor="#357ce6"
            style={styles.textWrapper}
            underlineColorAndroid="transparent"
            value={text}
          />
        ) : (
          this._renderPreview()
        )}
        {!isPreviewActive
          && this._renderEditorButtons({
            getState: this._getState,
            setState: (state, callback) => {
              this.textInput.focus();
              this.setState(state, callback);
            },
          })}
      </KeyboardAvoidingView>
    );
  }
}
