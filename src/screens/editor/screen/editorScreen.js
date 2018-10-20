import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { EditorHeader } from '../../../components/editorHeader';
import { TitleArea, TagArea, TextArea } from '../../../components/editorElements';
// Styles
import globalStyles from '../../../globalStyles';

export class EditorScreen extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      isPreviewActive: false,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPressPreviewButton = () => {
    const { isPreviewActive } = this.state;

    this.setState({ isPreviewActive: !isPreviewActive });
  };

  render() {
    const { isPreviewActive } = this.state;

    return (
      <View style={globalStyles.defaultContainer}>
        <EditorHeader
          isPreviewActive={isPreviewActive}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
        />
        <View style={globalStyles.containerHorizontal16}>
          <TitleArea isPreviewActive={isPreviewActive} />
          <TagArea isPreviewActive={isPreviewActive} />
        </View>
        <TextArea isPreviewActive={isPreviewActive} />
      </View>
    );
  }
}
