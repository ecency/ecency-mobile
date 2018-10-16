import React, { Component, Fragment } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { EditorHeader } from '../../../components/editorHeader';
import { TitleArea, TagArea, EditorBar } from '../../../components/editorElements';

// Styles
import globalStyles from '../../../globalStyles';

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
      <View style={globalStyles.defaultContainer}>
        <EditorHeader />
        <View style={globalStyles.containerHorizontal16}>
          <TitleArea />
          <TagArea />
        </View>
        <EditorBar />
      </View>
    );
  }
}
