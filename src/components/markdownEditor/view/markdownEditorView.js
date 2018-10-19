import React, { Component } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';

// Components
import Formats from './formats/formats';

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
    const { onMarkdownChange } = this.props;

    this.setState({ text: input });

    if (onMarkdownChange) {
      onMarkdownChange(input);
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
          <MarkdownView styles={previewStyles}>
            {text === '' ? 'There is nothing to preview here' : text}
          </MarkdownView>
        </ScrollView>
      </View>
    );
  };

  _renderMarkupButton = ({ item, getState, setState }) => (
    <TouchableOpacity onPress={() => item.onPress({ getState, setState, item })}>
      <Text style={item.style}>{item.title}</Text>
    </TouchableOpacity>
  );

  _renderEditorButtons = ({ getState, setState }) => (
    <View style={styles.editorButtons}>
      <FlatList
        data={Formats}
        keyboardShouldPersistTaps="always"
        renderItem={({ item }) => this._renderMarkupButton({ item, getState, setState })}
        horizontal
      />
    </View>
  );

  render() {
    const { placeHolder, isPreviewActive } = this.props;
    const { text, selection } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {!isPreviewActive ? (
          <TextInput
            style={styles.textWrapper}
            multiline
            underlineColorAndroid="transparent"
            onChangeText={this.changeText}
            onSelectionChange={this._handleOnSelectionChange}
            value={text}
            placeholder={placeHolder}
            placeholderTextColor="#c1c5c7"
            ref={textInput => (this.textInput = textInput)}
            selection={selection}
            selectionColor="#357ce6"
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
