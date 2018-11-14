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

  _handleOnSaveButtonPress = () => {
    const { handleOnSaveButtonPress } = this.props;
    const { formFields, tags } = this.state;

    handleOnSaveButtonPress({ formFields, tags });
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
    const { handleFormChanged } = this.props;
    const { formFields } = this.state;
    const newFormFields = formFields;

    newFormFields[componentID] = {
      content,
      isValid,
    };

    handleFormChanged();

    this.setState({ formFields: newFormFields });

    this._handleIsFormValid();
  };

  _handleOnTagAdded = (tags) => {
    this.setState({ tags: tags.filter(tag => tag && tag !== ' ') });
  };

  render() {
    const {
      isPreviewActive, wordsCount, isFormValid, formFields,
    } = this.state;
    const {
      isLoggedIn, isPostSending, isDraftSaving, isDraftSaved, draftPost,
    } = this.props;
    const title = (formFields['title-area'] && formFields['title-area'].content)
      || (draftPost && draftPost.title);
    const text = (formFields['text-area'] && formFields['text-area'].content) || (draftPost && draftPost.text);

    return (
      <View style={globalStyles.defaultContainer}>
        <EditorHeader
          handleOnSaveButtonPress={this._handleOnSaveButtonPress}
          isPostSending={isPostSending}
          isDraftSaving={isDraftSaving}
          isDraftSaved={isDraftSaved}
          isPreviewActive={isPreviewActive}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          isFormValid={isFormValid}
          isHasIcons
          isLoggedIn={isLoggedIn}
          handleOnSubmit={this._handleOnSubmit}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleOnSubmit={this._handleOnSubmit}
          isPreviewActive={isPreviewActive}
          isFormValid={isFormValid}
        >
          <TitleArea value={title} componentID="title-area" />
          <TagArea
            draftChips={draftPost && draftPost.tags}
            componentID="tag-area"
            handleTagChanged={this._handleOnTagAdded}
          />
          <TextArea value={text} handleOnTextChange={this._setWordsCount} componentID="text-area" />
        </PostForm>
      </View>
    );
  }
}
