import React, { Component } from 'react';
import { View, Text } from 'react-native';
// Constants

// Components
import { MarkdownEditor } from '../../../markdownEditor';

// Styles
import styles from './textAreaStyles';

export default class TextAreaView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  defaultMarkdownButton = ({ item, getState, setState }) => <Text>ugur</Text>;

  render() {
    return (
      <View style={styles.container}>
        <MarkdownEditor
          placeholderString="ugur"
          // markdownButton={e => this.defaultMarkdownButton(e)}
          placeholder="sss"
          {...this.props}
        />
      </View>
    );
  }
}
