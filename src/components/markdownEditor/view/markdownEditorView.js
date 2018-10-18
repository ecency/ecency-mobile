import React from 'react';
import {
  View, TextInput, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';

import { renderFormatButtons } from './renderButtons';
import styles from './markdownEditorStyles';

const markdownStyles = {
  heading1: {
    fontSize: 24,
    color: 'purple',
  },
  link: {
    color: 'pink',
  },
  mailTo: {
    color: 'orange',
  },
  text: {
    color: '#555555',
  },
};

export default class MarkdownEditorView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      selection: { start: 0, end: 0 },
    };
  }

  textInput: TextInput;

  componentDidMount() {
    this.textInput.focus();
  }

  changeText = (input: string) => {
    const { onMarkdownChange } = this.props;

    this.setState({ text: input });

    if (onMarkdownChange) {
      onMarkdownChange(input);
    }
  };

  onSelectionChange = (event) => {
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  getState = () => {
    this.setState({
      selection: {
        start: 1,
        end: 1,
      },
    });
    return this.state;
  };

  renderPreview = () => {
    const { text } = this.state;

    return (
      <View style={styles.textWrapper}>
        <ScrollView removeClippedSubviews>
          <MarkdownView styles={markdownStyles}>
            {text === '' ? 'There is nothing to preview here' : text}
          </MarkdownView>
        </ScrollView>
      </View>
    );
  };

  render() {
    const {
      Formats, markdownButton, placeHolder, isPreviewActive,
    } = this.props;
    const { text, selection } = this.state;
    return (
      <View style={styles.wrapper}>
        {!isPreviewActive ? (
          <View 
            style={styles.textWrapper}
          
          >
            <TextInput
              style={styles.textWrapper}
              multiline
              underlineColorAndroid="transparent"
              onChangeText={this.changeText}
              onSelectionChange={this.onSelectionChange}
              value={text}
              placeholder={placeHolder}
              ref={textInput => (this.textInput = textInput)}
              selection={selection}
              selectionColor="#357ce6"
            />
          </View>
        ) : (
          this.renderPreview()
        )}
        <KeyboardAvoidingView behavior="padding">
          {!isPreviewActive
            && renderFormatButtons(
              {
                getState: this.getState,
                setState: (state, callback) => {
                  this.textInput.focus();
                  this.setState(state, callback);
                },
              },
              Formats,
              markdownButton,
            )}
        </KeyboardAvoidingView>
      </View>
    );
  }
}
