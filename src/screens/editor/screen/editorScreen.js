import React, { Component } from 'react';
import { View } from 'react-native';
import { EditorHeader } from '../../../components/editorHeader';
// Constants

// Components

export class EditorScreen extends Component {
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

  render() {
    // eslint-disable-next-line
    return (
      <View>
        <EditorHeader />
      </View>
    );
  }
}
