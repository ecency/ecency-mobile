import React, { Component } from 'react';
import { View } from 'react-native';

// Utils
import { getWordsCount } from '../../../utils/editor';

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
      wordsCount: null,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPressPreviewButton = () => {
    const { isPreviewActive } = this.state;

    this.setState({ isPreviewActive: !isPreviewActive });
  };

  _handleOnTextChange = (text) => {
    const _wordsCount = getWordsCount(text);
    const { wordsCount } = this.state;

    if (_wordsCount !== wordsCount) {
      this.setState({ wordsCount: _wordsCount });
    }
  };

  render() {
    const { isPreviewActive, wordsCount } = this.state;

    return (
      <View style={globalStyles.defaultContainer}>
        <EditorHeader
          isPreviewActive={isPreviewActive}
          quickTitle={wordsCount && `${wordsCount} words`}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
        />
        <View style={globalStyles.containerHorizontal16}>
          <TitleArea isPreviewActive={isPreviewActive} />
          <TagArea isPreviewActive={isPreviewActive} />
        </View>
        <TextArea handleOnTextChange={this._handleOnTextChange} isPreviewActive={isPreviewActive} />
      </View>
    );
  }
}
