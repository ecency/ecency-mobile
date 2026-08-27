import React, { Component, Fragment } from 'react';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';
import { get, isNull, isEqual } from 'lodash';

// Utils
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCommunityQueryOptions } from '@ecency/sdk';
import {
  cleanAiTools,
  collectVideoThumbUrls,
  extractMetadata,
  getWordsCount,
  makeJsonMetadata,
} from '../../../utils/editor';

// Components
import {
  BasicHeader,
  MarkdownEditor,
  SelectCommunityAreaView,
  SelectCommunityModalContainer,
  Modal,
} from '../../../components';

// SDK
import { getQueryClient } from '../../../providers/queries';

// Styles
import globalStyles from '../../../globalStyles';
import RcPrecheckBanner from '../../../components/rcPrecheckBanner';
import { isCommunity } from '../../../utils/communityValidation';

import styles from './editorScreenStyles';
import PostOptionsModal from '../children/postOptionsModal';
import SaveTemplateModal from '../children/saveTemplateModal';
import { AiToolsMeta, CommunityRole, CommunityTypeId } from '../../../providers/hive/hive.types';
import { flushPendingEditorWork } from '../../../components/uploadsGalleryModal/mediaInsertQueue';

class EditorScreen extends Component<any, any> {
  changeTimer: any;

  // Latest body handed to `_handleFormUpdate`, recorded before its awaits so the
  // unmount save is not limited to what has already reached state.
  _latestBody: string | undefined;

  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */
  postOptionsModalRef: any = null;

  saveTemplateModalRef: any = null;

  constructor(props: any) {
    super(props);

    console.log('reading tags', props.draftPost?.tags, props.tags);

    this.state = {
      isFormValid: false,
      isPreviewActive: false,
      wordsCount: null,
      fields: {
        title: (props.draftPost && props.draftPost.title) || '',
        body: (props.draftPost && props.draftPost.body) || '',
        tags: (props.draftPost && props.draftPost.tags) || props.tags || [],
        community: props.community || [],
        isValid: false,
        // AI-usage disclosure flags, pre-checked when Ecency's own AI tools are used.
        // Restored from a reopened draft so the disclosure survives save/reopen.
        aiTools: (props.draftPost && props.draftPost.meta && props.draftPost.meta.ai_tools) || {},
      },
      isCommunitiesListModalOpen: false,
      selectedCommunity: null,
      selectedAccount: null,
      scheduledFor: null,
      draftPostProp: props.draftPost,
      canPostToCommunity: true,
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

  componentDidUpdate(prevProps: any, prevState: any) {
    const { isUploadingProp, communityProp, selectedCommunity } = this.state;
    if (
      prevState.isUploadingProp !== isUploadingProp ||
      prevState.selectedCommunity !== selectedCommunity
    ) {
      this._handleFormUpdate();
    }

    if (communityProp?.length > 0 && prevState.communityProp !== communityProp) {
      this._getCommunity(communityProp[0]);
      this._handleOnTagAdded(communityProp);
    }
  }

  componentWillUnmount() {
    const { isEdit } = this.props;
    // Commit anything the editor is still holding — keystrokes inside the 500ms
    // debounce, and an upload result queued behind live typing — BEFORE saving.
    // This runs ahead of every descendant's effect cleanup, so without draining
    // here the save below would write the body as it was before those landed,
    // storing an unresolved "Uploading..." placeholder for an image that had in
    // fact arrived.
    flushPendingEditorWork();
    if (!isEdit) {
      this._saveDraftToDB();
    }
  }

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    // shoudl update state
    const stateUpdate: any = {};
    console.log('reading tags in derived state', nextProps.draftPost?.tags, nextProps.tags);

    if (nextProps.draftPost !== prevState.draftPostProp) {
      stateUpdate.draftPostProp = nextProps.draftPost;
      const newDraftPost = nextProps.draftPost;

      if (newDraftPost.tags?.length > 0 && isCommunity(newDraftPost.tags[0])) {
        stateUpdate.communityProp = newDraftPost.tags;
      } else {
        stateUpdate.selectedAccount = nextProps.currentAccout;
      }

      if (nextProps.community && nextProps.community.length > 0) {
        stateUpdate.communityProp = [...nextProps.community, ...newDraftPost.tags];
        newDraftPost.tags = stateUpdate.communityProp;
      }

      stateUpdate.fields = {
        ...prevState.fields,
        ...newDraftPost,
      };
    }

    if (nextProps.isUploading !== prevState.isUploadingProp) {
      stateUpdate.isUploadingProp = nextProps.isUploading;
    }

    if (nextProps.community !== prevState.communityProp) {
      stateUpdate.communityProp = nextProps.community;
    }

    console.log('derived state update', stateUpdate);
    return stateUpdate;
  }

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

  _setWordsCount = (content: any) => {
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
          onPress: () => {
            console.log('cancel pressed');
          },
          style: 'cancel',
        },
      ]);
      return;
    }
    this._saveDraftToDB();
  };

  _saveCurrentDraft = (fields: any) => {
    const { saveCurrentDraft, updateDraftFields } = this.props;

    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      saveCurrentDraft(fields);
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

  _handleRewardChange = (value: any) => {
    const { handleRewardChange } = this.props;
    handleRewardChange(value);
  };

  _handlePostDescriptionChange = (value: string) => {
    const { handlePostDescriptionChange } = this.props as any;
    handlePostDescriptionChange(value);
  };

  _handleSettingsPress = () => {
    if (this.postOptionsModalRef) {
      this.postOptionsModalRef.show();
    }
  };

  // called from the post options modal after it closes itself; the delay lets
  // the options formSheet fully dismiss before presenting the name prompt
  // (iOS cannot present a second native modal while one is still animating out)
  _handleSaveTemplatePress = () => {
    setTimeout(() => {
      if (this.saveTemplateModalRef) {
        this.saveTemplateModalRef.show();
      }
    }, 500);
  };

  _handleSaveAsTemplate = (templateName: any) => {
    const { saveAsTemplate } = this.props;
    const { fields } = this.state;

    if (saveAsTemplate && (fields.title || fields.body)) {
      saveAsTemplate(fields, templateName);
    }
  };

  _checkCanPostToCommunity = () => {
    const { selectedCommunity } = this.state;
    const { isReply } = this.props;

    switch (selectedCommunity?.type_id) {
      case CommunityTypeId.JOURNEL: // only members can post, guests can comment
        return isReply || selectedCommunity.context.role !== CommunityRole.GUEST;
      case CommunityTypeId.COUNCIL: // only members can post to council
        return selectedCommunity.context.role !== CommunityRole.GUEST;
      default:
        return true;
    }
  };

  _handleIsFormValid = (bodyText?: any) => {
    const { fields } = this.state;
    const { isReply, isLoggedIn } = this.props;
    let isFormValid;

    // check for post permission based on community membership and type_id
    const canPostToCommunity = this._checkCanPostToCommunity();

    if (isReply) {
      isFormValid = canPostToCommunity && get(fields, 'body').length > 0;
    } else {
      isFormValid =
        canPostToCommunity &&
        get(fields, 'title', '') &&
        get(fields, 'title', '').length < 255 &&
        (get(fields, 'body', '') || (bodyText && bodyText > 0)) &&
        get(fields, 'tags', null) &&
        get(fields, 'tags', null).length <= 10 &&
        isLoggedIn;
    }
    this.setState({ isFormValid, canPostToCommunity });
  };

  // Records that an Ecency AI tool was used, pre-checking the AI-usage disclosure. The flag
  // rides on state.fields.aiTools and is read at publish time. Additive only -- Ecency never
  // un-discloses on the user's behalf.
  _handleAiToolUsed = (key: keyof AiToolsMeta) => {
    this.setState((prevState: any) => ({
      fields: {
        ...prevState.fields,
        aiTools: { ...(prevState.fields.aiTools || {}), [key]: true },
      },
    }));
  };

  _handleFormUpdate = async (componentID?: any, content?: any) => {
    const { handleFormChanged, thumbUrl, rewardType, getBeneficiaries, postDescription } =
      this.props;
    const { fields: _fields } = this.state;
    const fields = { ..._fields };

    if (componentID === 'body') {
      fields.body = content;
      this._latestBody = content;
    } else if (componentID === 'title') {
      fields.title = content;
    } else if (componentID === 'tag-area') {
      console.log('updating tags', content);
      fields.tags = content;
    }

    const _extractedMeta = await extractMetadata({
      body: fields.body,
      thumbUrl,
      fetchRatios: false,
    });
    const meta = Object.assign({}, _extractedMeta, {
      tags: fields.tags,
      beneficiaries: getBeneficiaries(),
      rewardType,
      description: postDescription,
    });
    const jsonMeta = makeJsonMetadata(meta, fields.tags);
    const _aiTools = cleanAiTools(fields.aiTools);
    if (_aiTools) {
      jsonMeta.ai_tools = _aiTools;
    }
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

    // Merge aiTools from the latest state (not the snapshot taken before the awaits above),
    // so a concurrent _handleAiToolUsed functional update isn't clobbered by this object set.
    this.setState(
      (prev: any) => ({ fields: { ...fields, aiTools: prev.fields.aiTools } }),
      () => {
        this._handleIsFormValid();
      },
    );
  };

  _handleOnTagAdded = async (tags: any) => {
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
    this.setState({ fields: __fields }, () => {
      this._handleFormUpdate('tag-area', __fields.tags);
    });
  };

  _handleChangeTitle = (text: any) => {
    const { fields: _fields } = this.state;

    _fields.title = text.replace('\n', ' ');

    this.setState({ fields: _fields }, () => {
      this._handleFormUpdate('title', _fields.title);
    });
  };

  _handlePressCommunity = (community: any) => {
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

  _getCommunity = async (hive: any) => {
    const { currentAccount } = this.props;
    try {
      const queryClient = getQueryClient();
      const community = await queryClient.fetchQuery(
        getCommunityQueryOptions(hive, currentAccount.name),
      );
      this.setState({ selectedCommunity: community });
    } catch (error) {
      console.log(error);
    }
  };

  _saveDraftToDB(saveAsNew?: boolean) {
    const { saveDraftToDB } = this.props;
    const { fields } = this.state;

    // `_handleFormUpdate` records the body synchronously but only reaches state
    // after an await, so on the unmount path state is a step behind. Prefer the
    // recorded value so a body just committed by the drain above is the one saved.
    const _fields =
      typeof this._latestBody === 'string' && this._latestBody !== fields.body
        ? { ...fields, body: this._latestBody }
        : fields;

    // save draft only if any of field is valid
    if (_fields.body || _fields.title) {
      saveDraftToDB(_fields, saveAsNew);
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
      canPostToCommunity,
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
      videoThumbs,
      handleVideoThumb,
      uploadProgress,
      rewardType,
      postDescription,
      setIsUploading,
      getBeneficiaries,
      getPollDraft,
      hasExplicitBeneficiaries,
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
          presentationStyle="formSheet"
          animationType="slide"
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
      <SafeAreaView edges={['top']} style={globalStyles.defaultContainer}>
        <BasicHeader
          handleSchedulePress={(date: any) => handleSchedulePress(date, fields)}
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
        {/* <PostForm
            handleFormUpdate={this._handleFormUpdate as any}
            handleBodyChange={this._setWordsCount}
          isFormValid={isFormValid}
          isPreviewActive={isPreviewActive}
        > */}
        <Fragment>
          <RcPrecheckBanner
            username={currentAccount?.name}
            fields={fields}
            post={post}
            isReply={isReply}
            isEdit={isEdit}
            thumbUrl={thumbUrl}
            videoThumbUrls={collectVideoThumbUrls({ videoThumbs, body: fields?.body })}
            pollDraft={getPollDraft && getPollDraft()}
            rewardType={rewardType}
            beneficiaries={getBeneficiaries && getBeneficiaries()}
            hasExplicitBeneficiaries={hasExplicitBeneficiaries}
          />
          {!isReply && !isEdit && (
            <SelectCommunityAreaView
              selectedAccount={selectedAccount}
              selectedCommunity={selectedCommunity}
              canPostToCommunity={canPostToCommunity}
              // because of the bug in react-native-modal
              // https://github.com/facebook/react-native/issues/26892
              onPressOut={() => this.setState({ isCommunitiesListModalOpen: true })}
              onPressIn={() => this.setState({ isCommunitiesListModalOpen: false })}
            />
          )}
          <MarkdownEditor
            draftId={draftId}
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
            handleFormUpdate={this._handleFormUpdate as any}
            handleAiToolUsed={this._handleAiToolUsed}
            handleBodyChange={this._setWordsCount}
            autoFocusText={autoFocusText}
            sharedSnippetText={sharedSnippetText}
            onLoadDraftPress={onLoadDraftPress}
            uploadProgress={uploadProgress}
            setIsUploading={setIsUploading}
            handleVideoThumb={handleVideoThumb}
            isPreviewActive={isPreviewActive}
          />
        </Fragment>

        {_renderCommunityModal()}

        <PostOptionsModal
          ref={(componentRef) => {
            this.postOptionsModalRef = componentRef;
          }}
          body={fields.body}
          draftId={draftId}
          thumbUrl={thumbUrl}
          videoThumbUrls={collectVideoThumbUrls({ videoThumbs, body: fields.body })}
          isEdit={isEdit}
          isCommunityPost={selectedCommunity !== null}
          rewardType={rewardType}
          postDescription={postDescription}
          handlePostDescriptionChange={this._handlePostDescriptionChange}
          isUploading={isUploading}
          handleThumbSelection={this._handleOnThumbSelection}
          handleRewardChange={this._handleRewardChange}
          handleScheduleChange={this._handleScheduleChange}
          handleShouldReblogChange={handleShouldReblogChange}
          handleFormUpdate={this._handleFormUpdate as any}
          canSaveTemplate={!isReply && !isEdit && !!(fields.title || fields.body)}
          handleSaveTemplatePress={this._handleSaveTemplatePress}
        />

        <SaveTemplateModal
          ref={(componentRef) => {
            this.saveTemplateModalRef = componentRef;
          }}
          onSave={this._handleSaveAsTemplate}
        />
      </SafeAreaView>
    );
  }
}

export default injectIntl(EditorScreen);
