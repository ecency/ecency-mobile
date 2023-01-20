import React, { useRef, useState, useEffect } from 'react';
import { Alert, View } from 'react-native';
import { useIntl } from 'react-intl';
import { get, isNull, isEqual } from 'lodash';

// Utils
import { extractMetadata, getWordsCount, makeJsonMetadata, delay } from '../../../utils/editor';

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
import { useAppSelector } from '../../../hooks';

const EditorScreen = ({
    paramFiles,
    handleOnImagePicker,
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
    autoFocusText,
    sharedSnippetText,
    onLoadDraftPress,
    thumbUrl,
    uploadProgress,
    rewardType,
    setIsUploading,
    draftPost,
    tags,
    community,
    initialEditor,
    saveDraftToDB,
    saveCurrentDraft,
    updateDraftFields,
    handleOnSubmit,
    setThumbUrl,
    handleFormChanged,
    getBeneficiaries

}) => {
    /* Props
     * ------------------------------------------------
     *   @prop { type }    name                - Description....
     */

    const intl = useIntl();

    const postOptionsModalRef = useRef<any>(null);
    const prevDraftRef = useRef(null);

    const currentAccount = useAppSelector(state => state.account.currentAccount);

    const [state, setState] = useState({
        isFormValid: false,
        isPreviewActive: false,
        wordsCount: 0,
        isRemoveTag: false,
        fields: {
            title: (draftPost && draftPost.title) || '',
            body: (draftPost && draftPost.body) || '',
            tags: (draftPost && draftPost.tags) || tags || [],
            community: community || [],
            isValid: false,
        },
        isCommunitiesListModalOpen: false,
        selectedCommunity: null,
        selectedAccount: null,
        scheduledFor: null,
    });



    useEffect(() => {
        if (draftPost && prevDraftRef.current !== draftPost) {
            if (draftPost.tags?.length > 0 && isCommunity(draftPost.tags[0])) {
                _getCommunity(draftPost.tags[0]);
            }


            setState({
                ...state,
                selectedAccount: currentAccount,
                fields: {
                    ...state.fields,
                    ...draftPost
                }
            });

        }
        prevDraftRef.current = draftPost;

        //unmount
        return () => {
            if (!isEdit) {
                _saveDraftToDB();
            }
        }
    }, [draftPost])


    useEffect(() => {
        setState({
            ...state,
            fields: {
                ...state.fields,
                community: community[0] || []
            }
        })
        _handleOnTagAdded(community);
    }, [community])


    useEffect(() => {
        if (!isUploading) {
            _handleFormUpdate();
        }
    }, [isUploading])


    useEffect(() => {
        _handleIsFormValid();
    }, [state.fields])



    // Component Functions
    const _initialFields = () => {

        setState({
            ...state,
            fields: {
                title: '',
                body: '',
                tags: [],
                isValid: false,
                community: []
            },
            isRemoveTag: true,
        });

        if (initialEditor) {
            initialEditor();
        }
    };

    const _handleOnPressPreviewButton = async () => {
        const { isPreviewActive } = state;

        setState({ ...state, isPreviewActive: !isPreviewActive })
        await delay(200)
        _handleIsFormValid();
    };

    const _setWordsCount = (content) => {
        const _wordsCount = getWordsCount(content);
        const { wordsCount } = state;

        if (_wordsCount !== wordsCount) {
            setState({ ...state, wordsCount: _wordsCount });
        }
    };

    const _handleOnSaveButtonPress = () => {

        if (draftId) {
            Alert.alert(intl.formatMessage({ id: 'editor.draft_save_title' }), '', [
                {
                    text: intl.formatMessage({ id: 'editor.draft_update' }),
                    onPress: () => _saveDraftToDB(),
                },
                {
                    text: intl.formatMessage({ id: 'editor.draft_save_new' }),
                    onPress: () => _saveDraftToDB(true),
                },
                {
                    text: intl.formatMessage({ id: 'alert.cancel' }),
                    onPress: () => { },
                    style: 'cancel',
                },
            ]);
            return;
        }
        _saveDraftToDB();
    };

    const _saveCurrentDraft = (fields) => {
        saveCurrentDraft(fields);
        updateDraftFields(fields);
    };

    const _handleOnSubmit = () => {

        const { fields, scheduledFor } = state;

        if (scheduledFor && handleSchedulePress) {
            handleSchedulePress(scheduledFor, fields);
            return;
        }

        if (handleOnSubmit) {
            handleOnSubmit({ fields });
        }
    };

    const _handleOnThumbSelection = (url: string) => {

        if (setThumbUrl) {
            setThumbUrl(url);
        }
    };

    const _handleScheduleChange = (datetime: string | null) => {
        setState({
            ...state,
            scheduledFor: datetime,
        });
    };

    const _handleRewardChange = (value) => {
        handleRewardChange(value);
    };

    const _handleSettingsPress = () => {
        if (postOptionsModalRef.current) {
            postOptionsModalRef.current.show();
        }
    };

    const _handleIsFormValid = (bodyText?) => {
        const { fields } = state;

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
        setState({ ...state, isFormValid });
    };

    const _handleFormUpdate = async (componentID?, content?) => {

        const { fields: _fields } = state;
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

            _saveCurrentDraft(fields);
        }

        setState({ ...state, fields })
    };




    const _handleOnTagAdded = async (tags) => {

        if (tags.length > 0) {
            if (!isCommunity(tags[0])) {
                setState({
                    ...state,
                    selectedCommunity: null,
                    selectedAccount: currentAccount,
                });
            }
        }

        const { fields: _fields } = state;
        const __tags = tags; // .map((t) => t.replace(/([^a-z0-9-]+)/gi, '').toLowerCase());
        const __fields = { ..._fields, tags: __tags };

        setState({ ...state, fields: __fields, isRemoveTag: false });
      
        _handleFormUpdate('tag-data', tags);
    };



    const _handleChangeTitle = async (text) => {
        const { fields: _fields } = state;

        _fields.title = text;

        setState({ ...state, fields: _fields });
        _handleFormUpdate('title', text);
    };

    const _handlePressCommunity = (community) => {
        const { fields, selectedCommunity } = state;


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

        setState({
            ...state,
            fields: { ...fields, tags },
            isCommunitiesListModalOpen: false,
            selectedCommunity: community,
            selectedAccount: community ? null : currentAccount,
        });
    };

    const _getCommunity = (hive) => {
        getCommunity(hive)
            .then((community) => {
                setState({
                    ...state,
                    selectedCommunity: community
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const _saveDraftToDB = (saveAsNew?: boolean) => {

        const { fields } = state;

        // save draft only if any of field is valid
        if (fields.body || fields.title) {
            saveDraftToDB(fields, saveAsNew);
        }
    }




    const {
        fields,
        isPreviewActive,
        wordsCount,
        isFormValid,
        isCommunitiesListModalOpen,
        selectedCommunity,
        selectedAccount,
        scheduledFor,
    } = state;


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
                    onPressCommunity={_handlePressCommunity}
                    currentAccount={currentAccount}
                    onCloseModal={() => {
                        setState({
                            ...state,
                            isCommunitiesListModalOpen: false
                        });
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
                handleOnPressPreviewButton={_handleOnPressPreviewButton}
                handleOnSaveButtonPress={_handleOnSaveButtonPress}
                handleOnSubmit={_handleOnSubmit}
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
                handleSettingsPress={_handleSettingsPress}
            />
            <PostForm
                handleFormUpdate={_handleFormUpdate}
                handleBodyChange={_setWordsCount}
                handleOnSubmit={_handleOnSubmit}
                isFormValid={isFormValid}
                isPreviewActive={isPreviewActive}
            >
                {!isReply && !isEdit && (
                    <SelectCommunityAreaView
                        selectedAccount={selectedAccount}
                        selectedCommunity={selectedCommunity}
                        // because of the bug in react-native-modal
                        // https://github.com/facebook/react-native/issues/26892
                        onPressOut={() => setState({ ...state, isCommunitiesListModalOpen: true })}
                        onPressIn={() => setState({ ...state, isCommunitiesListModalOpen: false })}
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
                    initialFields={_initialFields}
                    isReply={isReply}
                    isLoading={isPostSending}
                    isUploading={isUploading}
                    isEdit={isEdit}
                    post={post}
                    fields={fields}
                    currentAccount={currentAccount}
                    onTagChanged={_handleOnTagAdded}
                    onTitleChanged={_handleChangeTitle}
                    getCommunity={_getCommunity}
                    autoFocusText={autoFocusText}
                    sharedSnippetText={sharedSnippetText}
                    onLoadDraftPress={onLoadDraftPress}
                    uploadProgress={uploadProgress}
                    setIsUploading={setIsUploading}
                />
            </PostForm>

            {_renderCommunityModal()}

            <PostOptionsModal
                ref={postOptionsModalRef}
                body={fields.body}
                draftId={draftId}
                thumbUrl={thumbUrl}
                isEdit={isEdit}
                isCommunityPost={selectedCommunity !== null}
                rewardType={rewardType}
                isUploading={isUploading}
                handleThumbSelection={_handleOnThumbSelection}
                handleRewardChange={_handleRewardChange}
                handleScheduleChange={_handleScheduleChange}
                handleShouldReblogChange={handleShouldReblogChange}
                handleFormUpdate={_handleFormUpdate}
            />
        </View>
    );
}

export default EditorScreen;
