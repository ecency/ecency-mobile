import React, { Component } from 'react';
import { Alert, View } from 'react-native';
import { injectIntl } from 'react-intl';
import { get, isNull, isEqual } from 'lodash';

// Utils
import { extractMetadata, getWordsCount, makeJsonMetadata } from '../../../utils/editor';

// Components
import {
  BasicHeader,
  PostForm,
  MarkdownEditor,
  SelectCommunityAreaView,
  SelectCommunityModalContainer,
  Modal,
} from '../../../components';

// dhive

import { getCommunity } from '../../../providers/hive/dhive';

// Styles
import globalStyles from '../../../globalStyles';
import { isCommunity } from '../../../utils/communityValidation';

import styles from './editorScreenStyles';
import PostOptionsModal from '../children/postOptionsModal';

class EditorScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */
  postOptionsModalRef = null;

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
        tags: (props.draftPost && props.draftPost.tags) || props.tags || [],
        community: props.community || [],
        isValid: false,
      },
      isCommunitiesListModalOpen: false,
      selectedCommunity: null,
      selectedAccount: null,
      scheduledFor: null,
    };
  }

  // Component Life Cycles
  componentDidMount() {
    const { draftPost, currentAccount } = this.props;

    if (draftPost) {
      if (draftPost.tags?.length > 0 && isCommunity(draftPost.tags[0])) {
        this._getCommunity(draftPost.tags[0]);
      } else {
        this.setState({
          selectedAccount: currentAccount,
        });
      }
    }
  }

  componentWillUnmount() {
    const { isEdit } = this.props;
    if (!isEdit) {
      this._saveDraftToDB();
    }
  }

  UNSAFE_componentWillReceiveProps = async (prevProps,nextProps) => {
    const { draftPost, isUploading, community, currentAccount, selectedCommunity } = this.props;
    if(prevProps !== nextProps){
      this.setState({
        selectedCommunity: selectedCommunity,
      })
    }
    if (nextProps.draftPost && draftPost !== nextProps.draftPost) {
      if (nextProps.draftPost.tags?.length > 0 && isCommunity(nextProps.draftPost.tags[0])) {
        this._getCommunity(nextProps.draftPost.tags[0]);
      } else {
        this.setState({
          selectedAccount: currentAccount,
        });
      }

      await this.setState((prevState) => {
        if (community && community.length > 0) {
          nextProps.draftPost.tags = [...community, ...nextProps.draftPost.tags];
        }
        return {
          fields: {
            ...prevState.fields,
            ...nextProps.draftPost,
          },
        };
      });
    }

    if (isUploading !== nextProps) {
      this._handleFormUpdate();
    }

  };

  // Component Functions
  _initialFields = () => {
    const { initialEditor } = this.props;

    this.setState({
      fields: {
        title: '',
        body: '',
        tags: [],
        isValid: false,
      },
      isRemoveTag: true,
    });

    if (initialEditor) {
      initialEditor();
    }
  };

  _handleOnPressPreviewButton = () => {
    const { isPreviewActive } = this.state;

    this.setState({ isPreviewActive: !isPreviewActive }, () => {
      this._handleIsFormValid();
    });
  };

  _setWordsCount = (content) => {
    const _wordsCount = getWordsCount(content);
    const { wordsCount } = this.state;

    if (_wordsCount !== wordsCount) {
      this.setState({ wordsCount: _wordsCount });
    }
  };

  _handleOnSaveButtonPress = () => {
    const { draftId, intl } = this.props;
    if (draftId) {
      Alert.alert(intl.formatMessage({ id: 'editor.draft_save_title' }), '', [
        {
          text: intl.formatMessage({ id: 'editor.draft_update' }),
          onPress: () => this._saveDraftToDB(),
        },
        {
          text: intl.formatMessage({ id: 'editor.draft_save_new' }),
          onPress: () => this._saveDraftToDB(true),
        },
        {
          text: intl.formatMessage({ id: 'alert.cancel' }),
          onPress: () => {},
          style: 'cancel',
        },
      ]);
      return;
    }
    this._saveDraftToDB();
  };

  _saveCurrentDraft = (fields) => {
    const { saveCurrentDraft, updateDraftFields } = this.props;

    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      // saveCurrentDraft(fields);
      updateDraftFields(fields);
    }, 300);
  };

  _handleOnSubmit = () => {
    const { handleOnSubmit, handleSchedulePress } = this.props;
    const { fields, scheduledFor } = this.state;

    if (scheduledFor && handleSchedulePress) {
      handleSchedulePress(scheduledFor, fields);
      return;
    }

    if (handleOnSubmit) {
      handleOnSubmit({ fields });
    }
  };

  _handleOnThumbSelection = (url: string) => {
    const { setThumbUrl } = this.props;
    if (setThumbUrl) {
      setThumbUrl(url);
    }
  };

  _handleScheduleChange = (datetime: string | null) => {
    this.setState({
      scheduledFor: datetime,
    });
  };

  _handleRewardChange = (value) => {
    const { handleRewardChange } = this.props;
    handleRewardChange(value);
  };

  _handleSettingsPress = () => {
    if (this.postOptionsModalRef) {
      this.postOptionsModalRef.show();
    }
  };

  _handleIsFormValid = (bodyText) => {
    const { fields } = this.state;
    const { isReply, isLoggedIn } = this.props;
    let isFormValid;

    if (isReply) {
      isFormValid = get(fields, 'body').length > 0;
    } else {
      isFormValid =
        get(fields, 'title', '') &&
        get(fields, 'title', '').length < 255 &&
        (get(fields, 'body', '') || (bodyText && bodyText > 0)) &&
        get(fields, 'tags', null) &&
        get(fields, 'tags', null).length <= 10 &&
        isLoggedIn;
    }
    this.setState({ isFormValid });
  };

  _handleFormUpdate = (componentID, content) => {
    const { handleFormChanged, thumbUrl, rewardType, getBeneficiaries } = this.props;
    const { fields: _fields } = this.state;
    const fields = { ..._fields };

    if (componentID === 'body') {
      fields.body = content;
    } else if (componentID === 'title') {
      fields.title = content;
    } else if (componentID === 'tag-area') {
      fields.tags = content;
    }

    const meta = Object.assign({}, extractMetadata(fields.body, thumbUrl), {
      tags: fields.tags,
      beneficiaries: getBeneficiaries(),
      rewardType,
    });
    const jsonMeta = makeJsonMetadata(meta, fields.tags);
    fields.meta = jsonMeta;

    if (
      get(fields, 'body', '').trim() !== get(_fields, 'body', '').trim() ||
      get(fields, 'title', '').trim() !== get(_fields, 'title', '').trim() ||
      get(fields, 'tags') !== get(_fields, 'tags') ||
      !isEqual(get(fields, 'meta'), get(_fields, 'meta'))
    ) {
      console.log('jsonMeta : ', jsonMeta);
      handleFormChanged();

      this._saveCurrentDraft(fields);
    }

    this.setState({ fields }, () => {
      this._handleIsFormValid();
    });
  };

  _handleOnTagAdded = async (tags) => {
    const { currentAccount } = this.props;

    if (tags.length > 0) {
      if (!isCommunity(tags[0])) {
        this.setState({
          selectedCommunity: null,
          selectedAccount: currentAccount,
        });
      }
    }

    const { fields: _fields } = this.state;
    const __tags = tags; // .map((t) => t.replace(/([^a-z0-9-]+)/gi, '').toLowerCase());
    const __fields = { ..._fields, tags: __tags };
    this.setState({ fields: __fields, isRemoveTag: false }, () => {
      this._handleFormUpdate('tag-area', __fields.tags);
    });
  };

  _handleChangeTitle = (text) => {
    const { fields: _fields } = this.state;

    _fields.title = text;

    this.setState({ fields: _fields }, () => {
      this._handleFormUpdate('title', _fields.title);
    });
  };

  _handlePressCommunity = (community) => {
    const { fields, selectedCommunity } = this.state;
    const { currentAccount } = this.props;

    const tags = [...fields.tags];
    if (community == null) {
      if (!isNull(selectedCommunity)) {
        tags.shift();
      }
    } else {
      if (!isNull(selectedCommunity)) {
        tags.shift();
      }

      tags.unshift(community.name);
    }

    this.setState({
      fields: { ...fields, tags },
      isCommunitiesListModalOpen: false,
      selectedCommunity: community,
      selectedAccount: community ? null : currentAccount,
    });
  };

  _getCommunity = (hive) => {
    getCommunity(hive)
      .then((community) => {
        this.setState({ selectedCommunity: community });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  _saveDraftToDB(saveAsNew?: boolean) {
    const { saveDraftToDB } = this.props;
    const { fields } = this.state;

    // save draft only if any of field is valid
    if (fields.body || fields.title) {
      saveDraftToDB(fields, saveAsNew);
    }
  }

  render() {
    const {
      fields,
      isPreviewActive,
      wordsCount,
      isFormValid,
      isCommunitiesListModalOpen,
      selectedCommunity,
      selectedAccount,
      scheduledFor,
    } = this.state;
    const {
      paramFiles,
      handleOnImagePicker,
      intl,
      isDraftSaved,
      isDraftSaving,
      draftId,
      isEdit,
      isLoggedIn,
      isPostSending,
      isReply,
      isUploading,
      post,
      uploadedImage,
      handleOnBackPress,
      handleSchedulePress,
      handleRewardChange,
      handleShouldReblogChange,
      currentAccount,
      autoFocusText,
      sharedSnippetText,
      onLoadDraftPress,
      thumbUrl,
      uploadProgress,
      rewardType,
      setIsUploading,
    } = this.props;

    const rightButtonText = intl.formatMessage({
      id: isEdit
        ? 'basic_header.update'
        : isReply
        ? 'basic_header.reply'
        : scheduledFor
        ? 'basic_header.schedule'
        : 'basic_header.publish',
    });

    const _renderCommunityModal = () => {
      return (
        <Modal
          isOpen={isCommunitiesListModalOpen}
          animationType="animationType"
          presentationStyle="pageSheet"
          style={styles.modal}
        >
          <SelectCommunityModalContainer
            onPressCommunity={this._handlePressCommunity}
            currentAccount={currentAccount}
            onCloseModal={() => {
              this.setState({ isCommunitiesListModalOpen: false });
            }}
          />
        </Modal>
      );
    };

    return (
      <View style={globalStyles.defaultContainer}>
        <BasicHeader
          handleSchedulePress={(date) => handleSchedulePress(date, fields)}
          handleRewardChange={handleRewardChange}
          handleOnBackPress={handleOnBackPress}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          handleOnSaveButtonPress={this._handleOnSaveButtonPress}
          handleOnSubmit={this._handleOnSubmit}
          isDraftSaved={isDraftSaved}
          isDraftSaving={isDraftSaving}
          draftId={draftId}
          isEdit={isEdit}
          isFormValid={isFormValid}
          isHasIcons
          isLoading={isPostSending || isUploading}
          isLoggedIn={isLoggedIn}
          isPreviewActive={isPreviewActive}
          isReply={isReply}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
          rightButtonText={rightButtonText}
          handleSettingsPress={this._handleSettingsPress}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleBodyChange={this._setWordsCount}
          handleOnSubmit={this._handleOnSubmit}
          isFormValid={isFormValid}
          isPreviewActive={isPreviewActive}
        >
          {!isReply && !isEdit && (
            <SelectCommunityAreaView
              selectedAccount={selectedAccount}
              selectedCommunity={selectedCommunity}
              // because of the bug in react-native-modal
              // https://github.com/facebook/react-native/issues/26892
              onPressOut={() => this.setState({ isCommunitiesListModalOpen: true })}
              onPressIn={() => this.setState({ isCommunitiesListModalOpen: false })}
            />
          )}
          <MarkdownEditor
            paramFiles={paramFiles}
            componentID="body"
            draftBody={fields && fields.body}
            isFormValid={isFormValid}
            handleOpenImagePicker={handleOnImagePicker}
            intl={intl}
            uploadedImage={uploadedImage}
            initialFields={this._initialFields}
            isReply={isReply}
            isLoading={isPostSending}
            isUploading={isUploading}
            isEdit={isEdit}
            post={post}
            fields={fields}
            currentAccount={currentAccount}
            onTagChanged={this._handleOnTagAdded}
            onTitleChanged={this._handleChangeTitle}
            getCommunity={this._getCommunity}
            autoFocusText={autoFocusText}
            sharedSnippetText={sharedSnippetText}
            onLoadDraftPress={onLoadDraftPress}
            uploadProgress={uploadProgress}
            setIsUploading={setIsUploading}
          />
        </PostForm>

        {_renderCommunityModal()}

        <PostOptionsModal
          ref={(componentRef) => (this.postOptionsModalRef = componentRef)}
          body={fields.body}
          draftId={draftId}
          thumbUrl={thumbUrl}
          isEdit={isEdit}
          isCommunityPost={selectedCommunity !== null}
          rewardType={rewardType}
          isUploading={isUploading}
          handleThumbSelection={this._handleOnThumbSelection}
          handleRewardChange={this._handleRewardChange}
          handleScheduleChange={this._handleScheduleChange}
          handleShouldReblogChange={handleShouldReblogChange}
          handleFormUpdate={this._handleFormUpdate}
        />
      </View>
    );
  }
}

export default injectIntl(EditorScreen);
