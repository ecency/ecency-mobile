import React, { Component } from 'react';
import { View, Text, KeyboardAvoidingView } from 'react-native';
// Components
import { RichTextEditor, RichTextToolbar } from 'react-native-zss-rich-text-editor';
// Styles
import styles from './editorBarStyles';

/**
 *            Props Name        Description
 * @props -->  props name here   description here
 */

class EditorBarView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.container}>
          <RichTextToolbar getEditor={() => this.richtext} />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default EditorBarView;
