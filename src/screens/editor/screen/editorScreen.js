import React, { Component } from 'react';
import { View } from 'react-native';

// Utils
import { getWordsCount } from '../../../utils/editor';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
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
      isFormValid: false,
      isChanged: false,
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

    this.setState({ isChanged: true });
  };

  _handleOnTagAdded = (tags) => {
    const _tags = tags.filter(tag => tag && tag !== ' ');
    const fields = { ...this.state.fields };

    fields.tags = _tags;
    this.setState({ fields });
  };

  render() {
    const {
      isPreviewActive, wordsCount, isFormValid, fields, isChanged,
    } = this.state;
    const {
      isLoggedIn, isPostSending, isDraftSaving, isDraftSaved, draftPost
    } = this.props;

    return (
      <View style={globalStyles.defaultContainer}>
        <BasicHeader
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
          <TitleArea value={fields.title} componentID="title" />
          <TagArea
            draftChips={fields.tags}
            componentID="tag-area"
            handleTagChanged={this._handleOnTagAdded}
          />
          <TextArea
            draftBody={fields && fields.body}
            handleOnTextChange={this._setWordsCount}
            componentID="body"
          />
        </PostForm>
      </View>
    );
  }
}
