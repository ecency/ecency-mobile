import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import {
  View,
  KeyboardAvoidingView,
  FlatList,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { renderPostBody, postBodySummary } from '@ecency/render-helper';
import { useDispatch, useSelector } from 'react-redux';
import { View as AnimatedView } from 'react-native-animatable';
import { get } from 'lodash';
import { Icon } from '../../icon';

// Utils
import Formats from './formats/formats';
import applyMediaLink from './formats/applyMediaLink';

// Actions
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

// Components
import {
  IconButton,
  PostBody,
  StickyBar,
  TextInput,
  UserAvatar,
  TitleArea,
  TagArea,
  TagInput,
  SummaryArea,
  Modal,
  SnippetsModal,
  UploadsGalleryModal,
  Tooltip,
  InsertLinkModal,
} from '../../index';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './markdownEditorStyles';
import applySnippet from './formats/applySnippet';
import { MainButton } from '../../mainButton';
import isAndroidOreo from '../../../utils/isAndroidOreo';
import { OptionsModal } from '../../atoms';
import { UsernameAutofillBar } from './usernameAutofillBar';
import applyUsername from './formats/applyUsername';
import { walkthrough } from '../../../redux/constants/walkthroughConstants';

const MIN_BODY_INPUT_HEIGHT = 300;


const MarkdownEditorView = ({
  draftBody,
  handleOpenImagePicker,
  intl,
  isPreviewActive,
  isReply,
  isLoading,
  isUploading,
  initialFields,
  onChange,
  uploadedImage,
  isEdit,
  post,
  fields,
  onTagChanged,
  onTitleChanged,
  getCommunity,
  currentAccount,
  autoFocusText,
  sharedSnippetText,
  onLoadDraftPress,
  uploadProgress,
}) => {
  const dispatch = useDispatch();

  const bodyText = useRef('');
  const bodySelection = useRef({ start: 0, end: 0 });

  const [editable, setEditable] = useState(true);
  const [bodyInputHeight, setBodyInputHeight] = useState(MIN_BODY_INPUT_HEIGHT);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [showDraftLoadButton, setShowDraftLoadButton] = useState(false);

  const inputRef = useRef(null);
  const galleryRef = useRef(null);
  const clearRef = useRef(null);
  const uploadsGalleryModalRef = useRef(null);
  const insertLinkModalRef = useRef(null);
  const tooltipRef = useRef(null);

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );
  const draftBtnTooltipState = useSelector((state) => state.walkthrough.walkthroughMap);
  const draftBtnTooltipRegistered = draftBtnTooltipState.get(walkthrough.EDITOR_DRAFT_BTN);
  const headerText = post && (post.summary || postBodySummary(post, 150, Platform.OS));

  useEffect(() => {
    if (!isPreviewActive) {
      _setTextAndSelection({ selection: { start: 0, end: 0 }, text: bodyText.current });
    }
  }, [isPreviewActive]);

  useEffect(() => {
    if (onLoadDraftPress) {
      setShowDraftLoadButton(true);
      if (!draftBtnTooltipRegistered) {
        setTimeout(() => {
          tooltipRef.current?.openTooltip();
        }, 300);
      }
    }
  }, [onLoadDraftPress]);

  useEffect(() => {
    if (bodyText.current === '' && draftBody !== '') {
      let draftBodyLength = draftBody.length;
      _setTextAndSelection({
        selection: { start: draftBodyLength, end: draftBodyLength },
        text: draftBody,
      });
    }
  }, [draftBody]);

  useEffect(() => {
    //hide draft button if fields changes and button was visible
    if (showDraftLoadButton) {
      let isCreating =
        get(fields, 'title', '') !== '' ||
        get(fields, 'body', '') !== '' ||
        get(fields, 'tags', []) !== [];

      if (isCreating) {
        setShowDraftLoadButton(false);
      }
    }
  }, [fields]);

  useEffect(() => {
    if (sharedSnippetText) {
      _handleOnSnippetReceived(sharedSnippetText);
    }
  }, [sharedSnippetText]);

  useEffect(() => {
    if (editable === null) {
      // workaround for android context menu issue
      setEditable(false);
      setTimeout(() => {
        setEditable(!isLoading);
      }, 100);
    } else {
      setEditable(!isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    if (uploadedImage && uploadedImage.shouldInsert && !isUploading) {
      applyMediaLink({
        text: bodyText.current,
        selection: bodySelection.current,
        setTextAndSelection: _setTextAndSelection,
        items: [{ url: uploadedImage.url, text: uploadedImage.hash }],
      });
    }

    if (isUploading) {
      uploadsGalleryModalRef.current.showModal();
    }
  }, [uploadedImage, isUploading]);

  useEffect(() => {
    bodyText.current = draftBody;
  }, [draftBody]);

  useEffect(() => {
    if (isReply || (autoFocusText && inputRef && inputRef.current && draftBtnTooltipRegistered)) {
      // added delay to open keyboard, solves the issue of keyboard not opening
      setTimeout(() => {
        inputRef.current.focus();
      }, 1000);
    }
  }, [autoFocusText]);

  useEffect(() => {
    const nextText = bodyText.current.replace(bodyText.current, '');

    if (nextText && nextText.length > 0) {
      _changeText(bodyText.current);

    }
  }, [bodyText.current]);

  const changeUser = async () => {
    dispatch(toggleAccountsBottomSheet(!isVisibleAccountsBottomSheet));
  };

  const _onApplyUsername = (username) => {
    applyUsername({
      text: bodyText.current,
      selection: bodySelection.current,
      setTextAndSelection: _setTextAndSelection,
      username,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _changeText = useCallback((input) => {
    bodyText.current = input;

    //NOTE: onChange method is called by direct parent of MarkdownEditor that is PostForm, do not remove
    if (onChange) {
      onChange(input);
    }
  }, []);


  const _handleOnSelectionChange = async (event) => {
    bodySelection.current = event.nativeEvent.selection;
  };

  const _handleOnContentSizeChange = async (event) => {
    const height = Math.max(MIN_BODY_INPUT_HEIGHT, event.nativeEvent.contentSize.height + 100);
    setBodyInputHeight(height);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _setTextAndSelection = useCallback(({ selection: _selection, text: _text }) => {
    console.log('_text : ', _text);
    inputRef.current.setNativeProps({
      text: _text,
    });

    const _updateSelection = () => {
      bodySelection.current = _selection
      inputRef.current.setNativeProps({
        selection: _selection,
      });
    }

    // Workaround for iOS selection update issue
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        _updateSelection();
      }, 100);
    } else {
      _updateSelection()
    }

    if (isSnippetsOpen) {
      setIsSnippetsOpen(false);
    }

    _changeText(_text);
  }, []);

  const _renderPreview = () => (
    <ScrollView style={styles.previewContainer}>
      {bodyText.current ? (
        <PostBody body={renderPostBody(bodyText.current, true, Platform.OS === 'ios' ? false : true)} />
      ) : (
        <Text>...</Text>
      )}
    </ScrollView>
  );

  const _handleOnSnippetReceived = (snippetText) => {
    applySnippet({
      text: bodyText.current,
      selection: bodySelection.current,
      setTextAndSelection: _setTextAndSelection,
      snippetText: `\n${snippetText}\n`,
    });
  };

  const _handleOnMediaSelect = (mediaArray) => {
    const items = mediaArray.map((mediaInsert) => ({
      url: mediaInsert.url,
      text: mediaInsert.hash,
    }));

    if (items.length) {
      applyMediaLink({
        text: bodyText.current,
        selection: bodySelection.current,
        setTextAndSelection: _setTextAndSelection,
        items,
      });
    }
  };

  const _handleOnAddLinkPress = () => {
    insertLinkModalRef.current?.showModal({
      selectedText: bodyText.current.slice(bodySelection.current.start, bodySelection.current.end),
      selection: bodySelection.current,
    });
    inputRef.current?.blur();
  };
  const _handleOnAddLinkSheetClose = () => {
    inputRef.current?.focus();
  };
  const _handleInsertLink = ({ snippetText, selection }) => {
    applySnippet({
      text: bodyText.current,
      selection,
      setTextAndSelection: _setTextAndSelection,
      snippetText,
    });

    insertLinkModalRef.current?.hideModal();
  };
  const _renderMarkupButton = ({ item }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() =>
          item.onPress({
            text: bodyText.current,
            selection: bodySelection.current,
            setTextAndSelection: _setTextAndSelection,
            item
          })
        }
      />
    </View>
  );

  const _renderFloatingDraftButton = () => {
    if (showDraftLoadButton) {
      const _onPress = () => {
        setShowDraftLoadButton(false);
        onLoadDraftPress();
      };

      const Wrapper = draftBtnTooltipRegistered ? AnimatedView : View;
      return (
        <>
          <Wrapper style={styles.floatingContainer} animation="bounceInRight">
            <Tooltip
              ref={tooltipRef}
              text={intl.formatMessage({ id: 'walkthrough.load_draft_tooltip' })}
              walkthroughIndex={walkthrough.EDITOR_DRAFT_BTN}
            >
              <MainButton
                style={{ width: isLoading ? null : 120 }}
                onPress={_onPress}
                iconName="square-edit-outline"
                iconType="MaterialCommunityIcons"
                iconColor="white"
                text="DRAFT"
                isLoading={isLoading}
              />
            </Tooltip>
          </Wrapper>
        </>
      );
    }
  };

  const _renderEditorButtons = () => (
    <StickyBar>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={({ item, index }) => index < 3 && _renderMarkupButton({ item })}
          horizontal
        />
      </View>
      <View style={styles.rightButtonsWrapper}>
        <IconButton
          size={20}
          style={styles.rightIcons}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="link"
          onPress={() =>
            // Formats[3].onPress({ text, selection, setTextAndSelection: _setTextAndSelection })
            _handleOnAddLinkPress()
          }
        />
        <IconButton
          onPress={() => setIsSnippetsOpen(true)}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="MaterialCommunityIcons"
          name="text-short"
        />
        <IconButton
          onPress={() => {
            galleryRef.current.show();
          }}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="image"
        />
        <View style={styles.clearButtonWrapper}>
          <IconButton
            onPress={() => clearRef.current.show()}
            size={20}
            iconStyle={styles.clearIcon}
            iconType="FontAwesome"
            name="trash"
            backgroundColor={styles.clearButtonWrapper.backgroundColor}
          />
        </View>
      </View>
    </StickyBar>
  );

  const _handleClear = (index) => {
    if (index === 0) {
      initialFields();

      _setTextAndSelection({ text: '', selection: { start: 0, end: 0 } });
    }
  };
  const _renderEditor = () => (
    <>
      {isReply && !isEdit && <SummaryArea summary={headerText} />}
      {!isReply && (
        <TitleArea value={fields.title} onChange={onTitleChanged} componentID="title" intl={intl} />
      )}
      {!isReply && !isPreviewActive && (
        <TagInput
          value={fields.tags}
          componentID="tag-area"
          intl={intl}
          handleTagChanged={onTagChanged}
          setCommunity={getCommunity}
        />
      )}
      {!isReply && isPreviewActive && (
        <TagArea
          draftChips={fields.tags.length > 0 ? fields.tags : null}
          componentID="tag-area"
          intl={intl}
        />
      )}
      {isReply && (
        <View style={styles.replySection}>
          <TouchableOpacity style={styles.accountTile} onPress={() => changeUser()}>
            <View style={styles.avatarAndNameContainer}>
              <UserAvatar noAction username={currentAccount.username} />
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{`@${currentAccount.username}`}</Text>
              </View>
              <Icon
                size={24}
                iconStyle={styles.leftIcon}
                style={styles.iconArrow}
                name="arrow-drop-down"
                iconType="MaterialIcons"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {!isPreviewActive ? (
        <ThemeContainer>
          {({ isDarkTheme }) => (
            <TextInput
              multiline
              autoCorrect={true}
              autoFocus={!draftBtnTooltipRegistered ? false : true}
              onChangeText={_changeText}
              onSelectionChange={_handleOnSelectionChange}
              placeholder={intl.formatMessage({
                id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
              })}
              placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
              selectionColor="#357ce6"
              style={{ ...styles.textWrapper, height: bodyInputHeight }}
              underlineColorAndroid="transparent"
              innerRef={inputRef}
              editable={editable}
              contextMenuHidden={false}
              autoGrow={false}
              scrollEnabled={false}
              onContentSizeChange={_handleOnContentSizeChange}
            />
          )}
        </ThemeContainer>
      ) : (
        _renderPreview()
      )}
    </>
  );

  const _renderEditorWithScroll = () => (
    <ScrollView style={styles.container}>{_renderEditor()}</ScrollView>
  );

  const _renderEditorWithoutScroll = () => <View style={styles.container}>{_renderEditor()}</View>;

  const _renderContent = () => {
    const _innerContent = (
      <>
        {isAndroidOreo() ? _renderEditorWithoutScroll() : _renderEditorWithScroll()}
        <UsernameAutofillBar text={bodyText.current} selection={bodySelection.current} onApplyUsername={_onApplyUsername} />
        {_renderFloatingDraftButton()}
        {!isPreviewActive && _renderEditorButtons()}
      </>
    );

    return Platform.select({
      ios: (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          {_innerContent}
        </KeyboardAvoidingView>
      ),
      android: <View style={styles.container}>{_innerContent}</View>,
    });
  };

  return (
    <Fragment>
      {_renderContent()}

      <Modal
        isOpen={isSnippetsOpen}
        handleOnModalClose={() => setIsSnippetsOpen(false)}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        title={intl.formatMessage({ id: 'editor.snippets' })}
        animationType="slide"
        style={styles.modalStyle}
      >
        <SnippetsModal handleOnSelect={_handleOnSnippetReceived} />
      </Modal>

      <UploadsGalleryModal
        ref={uploadsGalleryModalRef}
        username={currentAccount.username}
        handleOnSelect={_handleOnMediaSelect}
        uploadedImage={uploadedImage}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      <InsertLinkModal
        ref={insertLinkModalRef}
        handleOnInsertLink={_handleInsertLink}
        handleOnSheetClose={_handleOnAddLinkSheetClose}
      />

      <OptionsModal
        ref={galleryRef}
        options={[
          intl.formatMessage({
            id: 'editor.open_gallery',
          }),
          intl.formatMessage({
            id: 'editor.capture_photo',
          }),
          intl.formatMessage({
            id: 'editor.uploaded_images',
          }),

          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={3}
        onPress={(index) => {
          if (index == 2) {
            uploadsGalleryModalRef.current.showModal();
          } else {
            handleOpenImagePicker(index === 0 ? 'image' : index === 1 && 'camera');
          }
        }}
      />
      <OptionsModal
        ref={clearRef}
        title={intl.formatMessage({
          id: 'alert.clear_alert',
        })}
        options={[
          intl.formatMessage({
            id: 'alert.clear',
          }),
          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={1}
        onPress={_handleClear}
      />
    </Fragment>
  );
};

export default MarkdownEditorView;
