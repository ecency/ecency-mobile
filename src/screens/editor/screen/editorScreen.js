import React, { Component } from 'react';
import { View } from 'react-native';

// Utils
import { getWordsCount } from '../../../utils/editor';

// Constants

// Components
import { EditorHeader } from '../../../components/editorHeader';
import { TitleArea, TagArea, TextArea } from '../../../components/editorElements';
import { PostForm } from '../../../components/postForm';
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
      formFields: {},
      isFormValid: false,
      tags: [],
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPressPreviewButton = () => {
    const { isPreviewActive } = this.state;

    this.setState({ isPreviewActive: !isPreviewActive });
  };

  _setWordsCount = (content) => {
    const _wordsCount = getWordsCount(content);
    const { wordsCount } = this.state;

    if (_wordsCount !== wordsCount) {
      this.setState({ wordsCount: _wordsCount });
    }
  };

  _handleOnSubmit = () => {
    const { handleOnSubmit } = this.props;
    const { formFields, tags } = this.state;

    if (handleOnSubmit) {
      handleOnSubmit({ formFields, tags });
    }
  };

  _handleIsFormValid = () => {
    const { formFields, tags } = this.state;

    this.setState({
      isFormValid:
        formFields['title-area']
        && formFields['text-area']
        && formFields['title-area'].isValid
        && formFields['text-area'].isValid
        && tags
        && tags.length > 0,
    });
  };

  _handleFormUpdate = (componentID, content, isValid) => {
    const { formFields } = this.state;
    const newFormFields = formFields;

    newFormFields[componentID] = {
      content,
      isValid,
    };

    this.setState({ formFields: newFormFields });

    this._handleIsFormValid();
  };

  _handleOnTagAdded = (tags) => {
    this.setState({ tags: tags.filter(tag => tag && tag !== ' ') });
  };

  render() {
    const { isPreviewActive, wordsCount, isFormValid } = this.state;

    return (
      <View style={globalStyles.defaultContainer}>
        <EditorHeader
          isPreviewActive={isPreviewActive}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          isFormValid={isFormValid}
          handleOnSubmit={this._handleOnSubmit}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleOnSubmit={this._handleOnSubmit}
          isPreviewActive={isPreviewActive}
          isFormValid={isFormValid}
        >
          <TitleArea componentID="title-area" />
          <TagArea componentID="tag-area" handleTagChanged={this._handleOnTagAdded} />
          <TextArea handleOnTextChange={this._setWordsCount} componentID="text-area" />
        </PostForm>
      </View>
    );
  }
}
