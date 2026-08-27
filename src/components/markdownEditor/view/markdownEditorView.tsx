import { postBodySummary, renderPostBody } from '@ecency/render-helper';
import { earnsQuestContentCredit, QUEST_MIN_CONTENT_LENGTH } from '@ecency/sdk';
import { debounce, get } from 'lodash';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { BounceInRight } from 'react-native-reanimated';
import { SheetManager } from 'react-native-actions-sheet';
import { shouldShowShortContentHint } from '../../../utils/shortContentHint';
import { Icon } from '../../icon';

// Utils
import applyMediaLink from '../children/formats/applyMediaLink';
import { sweepUploadingPlaceholders } from '../children/formats/sweepUploadingPlaceholders';

// Components
import {
  InsertLinkModal,
  Modal,
  PostBody,
  PostPoll,
  SnippetsModal,
  SummaryArea,
  TagArea,
  TagInput,
  TextInput,
  TitleArea,
  UserAvatar,
} from '../../index';

// Styles
import { useAppDispatch, useAppSelector, useAppStore } from '../../../hooks';
import { setDraftCaret } from '../../../redux/actions/editorActions';
import { selectIsDarkTheme } from '../../../redux/selectors';
import { walkthrough } from '../../../redux/constants/walkthroughConstants';
import { OptionsModal } from '../../atoms';
import { MainButton } from '../../mainButton';
import {
  MediaInsertContext,
  MediaInsertData,
} from '../../uploadsGalleryModal/container/uploadsGalleryModal';
import { EditorToolbar } from '../children/editorToolbar';
import applySnippet from '../children/formats/applySnippet';
import styles from '../styles/markdownEditorStyles';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import { convertToPollMeta } from '../../../utils/editor';
import { resolveRestoreCaret } from '../../../utils/editorCaret';
import { PollModes } from '../../postPoll';
import { SheetNames } from '../../../navigation/sheets';

// const MIN_BODY_INPUT_HEIGHT = 300;

const MarkdownEditorView = ({
  draftId,
  paramFiles,
  draftBody,
  intl,
  isPreviewActive,
  isReply,
  isLoading,
  initialFields,
  handleFormUpdate,
  handleAiToolUsed,
  handleBodyChange,
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
  setIsUploading,
  handleVideoThumb,
}: any) => {
  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const pollDraft = useAppSelector(
    (state) => state.editor.pollDraftsMap[draftId || DEFAULT_USER_DRAFT_ID],
  );

  const dispatch = useAppDispatch();
  // Read the persisted caret non-reactively so writing it back never
  // re-renders this (deliberately uncontrolled) editor — that re-render is the
  // exact Android typing race the uncontrolled redesign removed.
  const store = useAppStore();
  // Scope the caret cache key to the actual editing target so positions never
  // bleed across drafts, accounts, or edit sessions:
  //  - saved drafts/replies already carry a unique `draftId`
  //  - editing an existing post (no draftId) -> key by that post
  //  - a new, unsaved compose -> per-account default (mirrors the autosave key)
  const _caretKey =
    draftId ||
    (post?.author && post?.permlink
      ? `${post.author}/${post.permlink}`
      : DEFAULT_USER_DRAFT_ID + (currentAccount?.name ?? ''));
  // `draftId` can change from undefined to a real id after the first autosave,
  // so the debounced persister reads the key through a ref to avoid staleness.
  const caretKeyRef = useRef(_caretKey);
  caretKeyRef.current = _caretKey;

  const [editable, setEditable] = useState(true);
  // Whether the current body is long enough to earn points. Deliberately a boolean and
  // not the text: this editor is uncontrolled on purpose (see _changeText), so anything
  // that re-rendered per keystroke would bring back the Android typing race. Updated on
  // the existing 500ms debounce, which already calls setIsEditing, and React bails out
  // when the value has not flipped, so the hint costs no extra renders.
  const [earnsPoints, setEarnsPoints] = useState(() => earnsQuestContentCredit(draftBody || ''));
  // const [bodyInputHeight, setBodyInputHeight] = useState(MIN_BODY_INPUT_HEIGHT);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [showDraftLoadButton, setShowDraftLoadButton] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<any>(null);
  const clearRef = useRef<any>(null);
  const insertLinkModalRef = useRef<any>(null);
  const tooltipRef = useRef<any>(null);
  const bodyTextRef = useRef('');
  const bodySelectionRef = useRef({ start: 0, end: 0 });

  const draftBtnTooltipState = useAppSelector((state) => state.walkthrough.walkthroughMap);
  const draftBtnTooltipRegistered = draftBtnTooltipState.get(walkthrough.EDITOR_DRAFT_BTN);
  const headerText = post && (post.summary || postBodySummary(post, 150, Platform.OS as any));

  const _bodyHtmlForPreview = useMemo(
    () => isPreviewActive && renderPostBody(bodyTextRef.current || '...', true, false),
    [bodyTextRef.current, isPreviewActive],
  );

  useEffect(() => {
    bodyTextRef.current = '';
    bodySelectionRef.current = { start: 0, end: 0 };
  }, []);

  useEffect(() => {
    if (!isPreviewActive) {
      _setTextAndSelection({ selection: bodySelectionRef.current, text: bodyTextRef.current });
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
    if (bodyTextRef.current === '' && draftBody !== '') {
      // Resume at the user's last caret position instead of jumping through the
      // body. Clamp to the current length in case the body shrank since the caret
      // was saved. When no caret was saved (a legacy draft, one created on another
      // device, or the first open after this shipped) the fallback depends on the
      // surface: a post/draft opens at the TOP (0) so a long body opens at its start
      // instead of scrolling to the bottom; a reply keeps landing at the END so a
      // cached comment is appended to, not prepended (its body is short, so there is
      // no scroll problem and immediate typing is expected).
      const savedCaret = store.getState().editor.caretMap?.[_caretKey];
      // Strip dead "Uploading..." placeholders left by a previous session (their
      // uploads can no longer resolve into this editor), shifting the saved caret
      // past the removals. The swept body flows to the form/autosave through the
      // same debounced update this programmatic write already triggers.
      const swept = sweepUploadingPlaceholders(
        draftBody,
        typeof savedCaret === 'number' ? savedCaret : undefined,
      );
      const { caret, hasSavedCaret } = resolveRestoreCaret(swept.caret, swept.text.length, isReply);
      _setTextAndSelection({
        selection: { start: caret, end: caret },
        text: swept.text,
      });
      // Drop any caret write queued from the empty input's initial focus before this
      // load. It is stale relative to this authoritative restore (no real edit has
      // happened yet — the body just arrived), and would otherwise persist a caret 0
      // under this draft's key: on a no-caret draft that resurfaces prepend-on-type
      // next open, and on a saved-caret draft it clobbers the position being resumed.
      _persistCaret.cancel();
      if (swept.text !== draftBody) {
        // Commit the swept body to the form NOW rather than 500ms later on the
        // debounce. Both saves read `fields.body`, and the unmount save reads it
        // synchronously, so a draft closed right after opening would otherwise be
        // written back with the dead placeholder still in it — while the caret
        // below has already moved to swept coordinates. The two must agree.
        handleFormUpdate('body', swept.text);
        // A sweep shortened the body, so the stored caret now points past the text
        // it belonged to. Rewrite it to the shifted position (only when one was
        // actually saved — persisting the no-caret fallback of 0 is what the cancel
        // above guards against).
        if (hasSavedCaret) {
          dispatch(setDraftCaret(caretKeyRef.current, caret));
        }
      }
      // Opening a post/draft with no saved caret intentionally lands at position 0.
      // Do NOT keep an active cursor there: an auto-focused caret at 0 would prepend
      // on the next keystroke (the concern that reverted the previous fix) and the
      // keyboard would cover the draft. Blur so the view stays at the top and the
      // user taps where they want to continue — matching web, which opens drafts
      // unfocused at the top. The delayed focus effect independently re-derives this
      // and won't re-focus. Replies focus and append; a saved-caret resume stays
      // focused so the user continues exactly where they left off.
      if (!hasSavedCaret && !isReply) {
        inputRef.current?.blur();
      }
    }
  }, [draftBody]);

  useEffect(() => {
    // hide draft button if fields changes and button was visible
    if (showDraftLoadButton) {
      const isCreating =
        get(fields, 'title', '') !== '' ||
        get(fields, 'body', '') !== '' ||
        get(fields, 'tags', []).length !== 0;

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

  // NOTE: there is deliberately no `bodyTextRef.current = draftBody` sync effect
  // here. `draftBody` is `fields.body`, which is just this editor's own text echoed
  // back through the 500ms debounce, so it is always as old as or older than the
  // ref. Writing it into the ref reverted keystrokes typed since the echo was
  // captured (text silently lost if nothing was typed afterwards) and undid the
  // placeholder sweep the restore effect above applies. The restore effect owns the
  // one real transition (empty ref -> loaded body); every other programmatic body
  // change goes through _setTextAndSelection.

  useEffect(() => {
    if (isReply || (autoFocusText && inputRef && inputRef.current && draftBtnTooltipRegistered)) {
      // added delay to open keyboard, solves the issue of keyboard not opening
      const focusTimer = setTimeout(() => {
        // Skip focusing when we restored an existing non-reply body that still has no
        // saved caret: focusing would drop the cursor at the top (prepend-on-type) and
        // slide the keyboard over the draft. Re-derived here at fire time (not a stored
        // flag) so it can't go stale across draft/compose changes in the same mounted
        // editor: an empty compose (no body) or a draft the user has since edited (a
        // caret now exists) both focus normally; replies always focus.
        const restoredWithoutCaret =
          !isReply &&
          bodyTextRef.current !== '' &&
          typeof store.getState().editor.caretMap?.[caretKeyRef.current] !== 'number';
        if (!restoredWithoutCaret) {
          inputRef?.current?.focus();
        }
      }, 1000);
      // Clear the pending focus if the effect re-runs or the editor unmounts within
      // the delay, so we never fire focus() on a torn-down input or leak a stale timer.
      return () => clearTimeout(focusTimer);
    }
  }, [autoFocusText]);

  const changeUser = async () => {
    SheetManager.show(SheetNames.ACCOUNTS_SHEET);
  };

  // const _onApplyUsername = (username) => {
  //   applyUsername({
  //     text: bodyTextRef.current,
  //     selection: bodySelectionRef.current,
  //     setTextAndSelection: _setTextAndSelection,x
  //     username,
  //   });
  // };

  const _debouncedOnTextChange = useCallback(
    debounce(() => {
      console.log('setting is editing to', false);
      setIsEditing(false);
      setEarnsPoints(earnsQuestContentCredit(bodyTextRef.current));
      handleBodyChange(bodyTextRef.current);
      handleFormUpdate('body', bodyTextRef.current);
    }, 500),
    [],
  );

  const _changeText = useCallback(
    (input: any) => {
      // Uncontrolled — only refs are updated during typing to avoid
      // re-rendering the editor on every keystroke (was causing Android typing race).
      bodyTextRef.current = input;

      if (!isEditing) {
        setIsEditing(true);
      }

      _debouncedOnTextChange();
    },
    [isEditing, _debouncedOnTextChange],
  );

  // Debounced so dragging the caret/typing doesn't thrash AsyncStorage. The
  // dispatch only touches `caretMap`, which nothing subscribes to reactively,
  // so it never re-renders the editor.
  const _persistCaret = useCallback(
    debounce((pos) => {
      dispatch(setDraftCaret(caretKeyRef.current, pos));
    }, 600),
    [],
  );

  // On unmount, flush (not cancel) the pending debounced writes so the latest
  // caret and body are committed synchronously before the editor tears down.
  // Cancelling would drop the last cursor move / keystrokes within the debounce
  // window — leaving a stale caret and body on reopen — and letting them fire
  // late would write after unmount. Flushing both closes that window cleanly.
  useEffect(
    () => () => {
      _persistCaret.flush();
      _debouncedOnTextChange.flush();
    },
    [_persistCaret, _debouncedOnTextChange],
  );

  const _handleOnSelectionChange = async (event: any) => {
    const { selection } = event.nativeEvent;
    bodySelectionRef.current = selection;
    // Only persist caret moves the user actually made. A user caret change requires a
    // focused input, so gating on focus drops the native echo of a selection we set
    // programmatically while the body is blurred (restoring a no-caret draft at the
    // top) — which must not become the saved resume position. Programmatic sets while
    // the input IS focused (inserts, saved-caret restore) echo the position we mean to
    // keep anyway, so persisting them is harmless.
    if (inputRef.current?.isFocused?.()) {
      _persistCaret(selection.start);
    }
  };

  const _setTextAndSelection = useCallback(
    ({ selection: _selection, text: _text }: any) => {
      bodySelectionRef.current = _selection;
      bodyTextRef.current = _text;
      // Programmatic write (snippet/media/link insert, draft restore, reset).
      // Goes straight to native to avoid the controlled-input race.
      inputRef.current?.setNativeProps({ text: _text, selection: _selection });

      if (isSnippetsOpen) {
        setIsSnippetsOpen(false);
      }

      if (!isEditing) {
        setIsEditing(true);
      }
      _debouncedOnTextChange();
    },
    [isEditing, isSnippetsOpen, _debouncedOnTextChange],
  );

  const _renderPreview = () => (
    <ScrollView style={styles.previewContainer} contentContainerStyle={styles.previewContent}>
      <View style={styles.previewHeader}>
        <TitleArea value={fields.title} intl={intl} />
        <TagArea
          draftChips={fields.tags.length > 0 ? fields.tags : null}
          componentID="tag-area"
          intl={intl}
          isPreviewActive={isPreviewActive}
        />
      </View>

      <PostBody body={_bodyHtmlForPreview} />
      {pollDraft && (
        <PostPoll initMode={PollModes.PREVIEW} metadata={convertToPollMeta(pollDraft)} />
      )}
    </ScrollView>
  );

  const _handleOnSnippetReceived = (snippetText: any) => {
    applySnippet({
      text: bodyTextRef.current,
      selection: bodySelectionRef.current,
      setTextAndSelection: _setTextAndSelection,
      snippetText: `\n${snippetText}\n`,
    });
    setIsSnippetsOpen(false);
  };

  const _handleMediaInsert = (mediaArray: MediaInsertData[], context?: MediaInsertContext) => {
    if (mediaArray.length) {
      applyMediaLink({
        text: bodyTextRef.current,
        selection: bodySelectionRef.current,
        setTextAndSelection: _setTextAndSelection,
        items: mediaArray,
        otherPending: context?.otherPending,
      });
    }
  };

  const _handleOnAddLinkPress = () => {
    insertLinkModalRef.current?.showModal({
      selectedText: bodyTextRef.current.slice(
        bodySelectionRef.current.start,
        bodySelectionRef.current.end,
      ),
      selection: bodySelectionRef.current,
    });
    inputRef?.current?.blur();
  };

  const _handleOnAddLinkSheetClose = () => {
    inputRef?.current?.focus();
  };

  const _handleInsertLink = ({ snippetText, selection }: any) => {
    applySnippet({
      text: bodyTextRef.current,
      selection,
      setTextAndSelection: _setTextAndSelection,
      snippetText,
    });

    insertLinkModalRef.current?.hideModal();
  };

  // Dictated text goes in at the caret, like a snippet -- not replacing the body the
  // way the AI assist edit actions do. Someone dictating mid-draft is adding to it.
  // Deliberately not applySnippet: that leaves the inserted text SELECTED
  // ({start, start + len}), and replaceBetween overwrites whatever is selected. With
  // dictation inserting repeatedly while the sheet stays open, each segment would
  // have replaced the one before it instead of following it.
  const _handleDictationResult = useCallback(
    (text: string) => {
      const body = bodyTextRef.current;
      const selection = bodySelectionRef.current;
      const before = body.substring(0, selection.start);
      // Space between segments so dictated sentences do not run together, but not a
      // double space when the caret already sits after whitespace or at the start.
      const separator = before.length === 0 || /\s$/.test(before) ? '' : ' ';
      const insertion = `${separator}${text}`;
      const caret = selection.start + insertion.length;

      _setTextAndSelection({
        text: before + insertion + body.substring(selection.end),
        // Collapsed AFTER the insertion, so the next segment continues from here.
        selection: { start: caret, end: caret },
      });
    },
    [_setTextAndSelection],
  );

  const _handleAiAssistResult = useCallback(
    (output: string, action: string) => {
      if (action === 'improve' || action === 'check_grammar' || action === 'summarize') {
        // Only body-editing actions set the "writing_edit" disclosure. Title generation and
        // tag suggestions aren't grammar/formatting edits, so they leave it unset.
        handleAiToolUsed?.('writing_edit');
        // Replace entire body with AI output
        _setTextAndSelection({
          text: output,
          selection: { start: output.length, end: output.length },
        });
      } else if (action === 'generate_title') {
        onTitleChanged?.(output);
      } else if (action === 'suggest_tags') {
        try {
          const tags = JSON.parse(output);
          if (Array.isArray(tags)) {
            onTagChanged?.(tags);
          }
        } catch {
          // fallback: treat as comma-separated
          const tags = output
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
          if (tags.length) {
            onTagChanged?.(tags);
          }
        }
      }
    },
    [_setTextAndSelection, onTitleChanged, onTagChanged, handleAiToolUsed],
  );

  // Compose-side translation: the sheet builds an appendix from the current
  // body and hands it back here, where it is appended through the same
  // programmatic write the AI assist result uses.
  const _showTranslateModal = () => {
    const currentTitle = fields?.title ?? '';
    SheetManager.show(SheetNames.COMPOSE_TRANSLATE, {
      payload: {
        body: bodyTextRef.current,
        title: currentTitle,
        onApply: (appendix: string, titleMarker?: string) => {
          const newBody = `${bodyTextRef.current}${appendix}`;
          _setTextAndSelection({
            text: newBody,
            selection: { start: newBody.length, end: newBody.length },
          });
          if (titleMarker) {
            onTitleChanged?.(`${currentTitle}${titleMarker}`);
          }
        },
      },
    });
  };

  const _renderFloatingDraftButton = () => {
    if (showDraftLoadButton) {
      const _onPress = () => {
        setShowDraftLoadButton(false);
        onLoadDraftPress();
      };

      return (
        <Animated.View style={styles.floatingContainer} entering={BounceInRight}>
          <MainButton
            style={{ width: isLoading ? null : 120 }}
            onPress={_onPress}
            iconName="square-edit-outline"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text="DRAFT"
            isLoading={isLoading}
          />
        </Animated.View>
      );
    }
  };

  const _handleClear = (index: any) => {
    if (index === 0) {
      initialFields();

      _setTextAndSelection({ text: '', selection: { start: 0, end: 0 } });
    }
  };
  // `earnsPoints` is the only part that changes as the user types, and it is recomputed
  // on the same debounce that already re-renders this component. The remaining gates are
  // render-stable, so reading the body ref here needs no re-render of its own. The ref is
  // the authoritative body once the draft has loaded into it; falling back to `draftBody`
  // would keep nagging about a reply the user had just cleared.
  // `isReply` is gated here rather than in the helper: this editor also composes posts,
  // where a body short enough to trip the rule is not a real case and would be noise.
  const _showShortReplyHint =
    isReply &&
    shouldShowShortContentHint({
      isEditing: isEdit,
      username: currentAccount?.name,
      body: bodyTextRef.current,
      earnsCredit: earnsPoints,
    });

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

      {isReply && (
        <View style={styles.replySection}>
          <TouchableOpacity style={styles.accountTile} onPress={() => changeUser()}>
            <View style={styles.avatarAndNameContainer}>
              <UserAvatar noAction username={currentAccount.name} />
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{`@${currentAccount.name}`}</Text>
              </View>
              <Icon
                size={24}
                style={styles.iconArrow}
                name="arrow-drop-down"
                iconType="MaterialIcons"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        multiline={true}
        autoCorrect={Platform.OS === 'ios'}
        autoComplete={Platform.OS === 'ios' ? undefined : 'off'}
        spellCheck={Platform.OS === 'ios'}
        autoFocus={!!draftBtnTooltipRegistered}
        onChangeText={_changeText}
        onSelectionChange={_handleOnSelectionChange}
        placeholder={intl.formatMessage({
          id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
        })}
        placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
        selectionColor="#357ce6"
        style={styles.textWrapper}
        underlineColorAndroid="transparent"
        innerRef={inputRef}
        editable={editable}
        contextMenuHidden={false}
        scrollEnabled={true}
        defaultValue={bodyTextRef.current || draftBody || ''}
      />
      {_showShortReplyHint && (
        <Text style={styles.shortReplyHint}>
          {intl.formatMessage({ id: 'editor.short_reply_hint' }, { n: QUEST_MIN_CONTENT_LENGTH })}
        </Text>
      )}
    </>
  );

  // The multiline TextInput owns its own scrolling (scrollEnabled=true) inside a plain
  // flex View. Wrapping it in an outer ScrollView (with the input's scrollEnabled=false)
  // created two competing scroll containers that both tracked the caret, which jumped the
  // body up and down while typing. This self-scrolling layout is what Android 8.0/8.1
  // already shipped without that issue; it now runs on every platform.
  const _editor = <View style={styles.container}>{_renderEditor()}</View>;

  const _renderContent = () => {
    const _editorContent = (
      <>
        {_editor}

        {/* {isDraftUpdated && (
          <UsernameAutofillBar
            text={bodyText}
            selection={bodySelection}
            onApplyUsername={_onApplyUsername}
          />
        )} */}

        {_renderFloatingDraftButton()}

        <EditorToolbar
          draftId={draftId}
          postBody={bodyTextRef.current}
          isEditing={isEditing}
          isPreviewActive={isPreviewActive}
          paramFiles={paramFiles}
          isEditMode={isEdit}
          isReply={isReply}
          suggestedPrompt={fields?.title?.trim() || undefined}
          setIsUploading={setIsUploading}
          handleMediaInsert={_handleMediaInsert}
          handleVideoThumb={handleVideoThumb}
          // The editor is uncontrolled, so `postBody` above is only as fresh as the last
          // render. Reads that must see the current text go through this.
          getPostBody={() => bodyTextRef.current}
          handleAiToolUsed={handleAiToolUsed}
          handleOnAddLinkPress={_handleOnAddLinkPress}
          handleShowSnippets={() => setIsSnippetsOpen(true)}
          handleOnClearPress={() => clearRef.current.show()}
          handleAiAssistResult={_handleAiAssistResult}
          handleOnDictationResult={_handleDictationResult}
          handleShowTranslate={_showTranslateModal}
          handleOnMarkupButtonPress={(item) => {
            item.onPress({
              text: bodyTextRef.current,
              selection: bodySelectionRef.current,
              setTextAndSelection: _setTextAndSelection,
              item,
            });
          }}
        />
      </>
    );

    const _innerContent = isPreviewActive ? _renderPreview() : _editorContent;

    return <View style={styles.container}>{_innerContent}</View>;
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

      <InsertLinkModal
        ref={insertLinkModalRef}
        handleOnInsertLink={_handleInsertLink}
        handleOnSheetClose={_handleOnAddLinkSheetClose}
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
