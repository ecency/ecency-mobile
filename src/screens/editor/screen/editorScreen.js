import React, { Component } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import { getWordsCount } from '../../../utils/editor';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import {
  TitleArea, TagArea, TextArea, SummaryArea,
} from '../../../components/editorElements';
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
      isRemoveTag: false,
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
  _initialFields = () => {
    this.setState({
      fields: {
        title: '',
        body: '',
        tags: [],
        isValid: false,
      },
      isRemoveTag: true,
    });
  };

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
    const { saveDraftToDB } = this.props;
    const { fields } = this.state;

    saveDraftToDB(fields);
  };

  _saveCurrentDraft = () => {
    const { saveCurrentDraft } = this.props;
    const { fields } = this.state;

    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      saveCurrentDraft(fields);
    }, 300);
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
    const { isReply } = this.props;
    let _isFormValid;

    if (isReply) {
      _isFormValid = fields && fields.body && fields.body.length > 0;
    } else {
      _isFormValid = fields
        && fields.title
        && fields.title.length > 0
        && fields.body
        && fields.body.length > 0
        && fields.tags.length > 0;
    }

    this.setState({ isFormValid: _isFormValid });
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
    this._saveCurrentDraft();
  };

  _handleOnTagAdded = (tags) => {
    const _tags = tags.filter(tag => tag && tag !== ' ');
    const fields = { ...this.state.fields };
    
    fields.tags = _tags;
    this.setState({ fields, isRemoveTag: false, });
  };

  render() {
    const {
      fields, isPreviewActive, wordsCount, isFormValid, isRemoveTag,
    } = this.state;
    const {
      draftPost,
      handleOnImagePicker,
      intl,
      isDraftSaved,
      isDraftSaving,
      isEdit,
      isLoggedIn,
      isPostSending,
      isReply,
      isUploading,
      post,
      uploadedImage,
      handleOnBackPress,
    } = this.props;
    const rightButtonText = intl.formatMessage({
      id: isEdit ? 'basic_header.update' : isReply ? 'basic_header.reply' : 'basic_header.publish',
    });

    return (
      <View style={globalStyles.defaultContainer}>
        <BasicHeader
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          handleOnSaveButtonPress={this._handleOnSaveButtonPress}
          handleOnSubmit={this._handleOnSubmit}
          handleOnBackPress={handleOnBackPress}
          isDraftSaved={isDraftSaved}
          isDraftSaving={isDraftSaving}
          isFormValid={isFormValid}
          isHasIcons
          isEdit={isEdit}
          isLoggedIn={isLoggedIn}
          isReply={isReply}
          isLoading={isPostSending || isUploading}
          isPreviewActive={isPreviewActive}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
          rightButtonText={rightButtonText}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleOnSubmit={this._handleOnSubmit}
          isFormValid={isFormValid}
          isPreviewActive={isPreviewActive}
        >
          {isReply && !isEdit && <SummaryArea summary={post.summary} />}
          {!isReply && <TitleArea value={fields.title} componentID="title" intl={intl} />}
          {!isReply && (
            <TagArea
              draftChips={fields.tags.length > 0 ? fields.tags : null}
              isRemoveTag={isRemoveTag}
              componentID="tag-area"
              handleTagChanged={this._handleOnTagAdded}
              intl={intl}
            />
          )}
          <TextArea
            componentID="body"
            draftBody={fields && fields.body}
            handleOnTextChange={this._setWordsCount}
            handleOpenImagePicker={handleOnImagePicker}
            intl={intl}
            uploadedImage={uploadedImage}
            initialFields={this._initialFields}
            isReply={isReply}
          />
        </PostForm>
      </View>
    );
  }
}

export default injectIntl(EditorScreen);
