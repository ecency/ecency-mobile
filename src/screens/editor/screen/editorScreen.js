import React, { Component } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import { getWordsCount } from '../../../utils/editor';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TitleArea, TagArea, TextArea } from '../../../components/editorElements';
import { PostForm } from '../../../components/postForm';
// Styles
import globalStyles from '../../../globalStyles';

class EditorScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isFormValid: false,
      isPreviewActive: false,
      wordsCount: null,
      fields: {
        title: (props.draftPost && props.draftPost.title) || '',
        body: (props.draftPost && props.draftPost.body) || '',
        tags: (props.draftPost && props.draftPost.tags) || [],
        isValid: false,
      },
    };
  }

  // Component Life Cycles
  componentWillReceiveProps = (nextProps) => {
    const { draftPost } = this.props;

    if (nextProps.draftPost && draftPost !== nextProps.draftPost) {
      this.setState({
        fields: {
          ...nextProps.draftPost,
        },
      });
    }
  };

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
    const { fields } = this.state;

    handleOnSaveButtonPress(fields);
  };

  _handleOnSubmit = () => {
    const { handleOnSubmit } = this.props;
    const { fields } = this.state;

    if (handleOnSubmit) {
      handleOnSubmit({ fields });
    }
  };

  _handleIsFormValid = () => {
    const { fields } = this.state;

    this.setState({
      isFormValid:
        fields.title
        && fields.title.length > 0
        && fields.body
        && fields.body.length > 0
        && fields.tags.length > 0,
    });
  };

  _handleFormUpdate = (componentID, content) => {
    const { handleFormChanged } = this.props;
    const fields = { ...this.state.fields };

    if (componentID === 'body') {
      fields.body = content;
    } else if (componentID === 'title') {
      fields.title = content;
    }

    this.setState({ fields });

    handleFormChanged();

    this._handleIsFormValid();
  };

  _handleOnTagAdded = (tags) => {
    const _tags = tags.filter(tag => tag && tag !== ' ');
    const fields = { ...this.state.fields };

    fields.tags = _tags;
    this.setState({ fields });
  };

  render() {
    const {
      isPreviewActive, wordsCount, isFormValid, fields,
    } = this.state;
    const {
      autoFocusText,
      handleOnImagePicker,
      intl,
      isDraftSaved,
      isDraftSaving,
      isLoggedIn,
      isPostSending,
      uploadedImage,
    } = this.props;

    return (
      <View style={globalStyles.defaultContainer}>
        <BasicHeader
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          handleOnSaveButtonPress={this._handleOnSaveButtonPress}
          handleOnSubmit={this._handleOnSubmit}
          isDraftSaved={isDraftSaved}
          isDraftSaving={isDraftSaving}
          isFormValid={isFormValid}
          isHasIcons
          isLoggedIn={isLoggedIn}
          isPostSending={isPostSending}
          isPreviewActive={isPreviewActive}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleOnSubmit={this._handleOnSubmit}
          isFormValid={isFormValid}
          isPreviewActive={isPreviewActive}
        >
          <TitleArea
            autoFocus={autoFocusText}
            componentID="title"
            intl={intl}
            value={fields.title}
          />
          <TagArea
            autoFocus={autoFocusText}
            componentID="tag-area"
            draftChips={fields.tags}
            handleTagChanged={this._handleOnTagAdded}
            intl={intl}
          />
          <TextArea
            componentID="body"
            draftBody={fields && fields.body}
            handleOnTextChange={this._setWordsCount}
            handleOpenImagePicker={handleOnImagePicker}
            intl={intl}
            uploadedImage={uploadedImage}
          />
        </PostForm>
      </View>
    );
  }
}

export default injectIntl(EditorScreen);
