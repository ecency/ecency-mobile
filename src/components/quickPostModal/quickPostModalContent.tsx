import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  Fragment,
  useMemo,
} from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { get, debounce } from 'lodash';
import { postBodySummary } from '@ecency/render-helper';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommunityQueryOptions } from '@ecency/sdk';
import { useQuery } from '@tanstack/react-query';
import styles from './quickPostModal.styles';
import {
  Icon,
  IconButton,
  MainButton,
  PollWizardModal,
  PopoverWrapper,
  TextButton,
  TextInput,
  UploadsGalleryModal,
  UserAvatar,
} from '..';
import { delay } from '../../utils/editor';
import { deleteReplyCacheEntry, updateReplyCache } from '../../redux/actions/cacheActions';
import { default as ROUTES } from '../../constants/routeNames';
import RootNavigation from '../../navigation/rootNavigation';
import { Draft } from '../../redux/reducers/cacheReducer';
import { RootState } from '../../redux/store/store';
import { selectCurrentAccount, selectReplyById } from '../../redux/selectors';
import { useAppSelector } from '../../hooks';

import { postQueries } from '../../providers/queries';
import { usePostSubmitter } from './usePostSubmitter';
import {
  MediaInsertData,
  MediaInsertStatus,
} from '../uploadsGalleryModal/container/uploadsGalleryModal';
import { removePollDraft } from '../../redux/actions/editorActions';
import { CommunityRole, CommunityTypeId } from '../../providers/hive/hive.types';

export interface QuickPostModalContentProps {
  mode: 'comment' | 'wave' | 'post';
  selectedPost?: any;
  onClose: () => void;
}

const MAX_BODY_LENGTH = 250;

export const QuickPostModalContent = forwardRef(
  ({ mode, selectedPost, onClose }: QuickPostModalContentProps, ref) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    const uploadsGalleryModalRef = useRef(null);
    const postsCachePrimer = postQueries.usePostsCachePrimer();
    const postSubmitter = usePostSubmitter();

    const inputRef = useRef<RNTextInput | null>(null);
    const pollWizardModalRef = useRef(null);
    const commentValueRef = useRef('');
    const isSubmittingRef = useRef(false);

    const currentAccount = useAppSelector(selectCurrentAccount);
    const pollDraftsMap = useAppSelector((state: RootState) => state.editor.pollDraftsMap);

    const [commentValue, setCommentValue] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [canCommentToCommunity, setCanCommentToCommunity] = useState(true);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [communityToCheck, setCommunityToCheck] = useState<string | null>(null);

    const parentAuthor = selectedPost ? selectedPost.author : '';
    const parentPermlink = selectedPost ? selectedPost.permlink : '';

    // Use SDK query to fetch community data - only when communityToCheck is set
    const { data: community } = useQuery({
      ...getCommunityQueryOptions(communityToCheck || '', currentAccount.name),
      enabled: !!communityToCheck,
    });

    const headerText =
      mode === 'wave'
        ? intl.formatMessage(
            { id: 'quick_reply.summary_wave' },
            { host: intl.formatMessage({ id: 'quick_reply.host_waves' }) }, // TODO: update based on selected host
          )
        : selectedPost && (selectedPost.summary || postBodySummary(selectedPost, 150, Platform.OS));

    const draftId = useMemo(
      () =>
        mode === 'wave'
          ? `${currentAccount.name}/ecency.waves` // TODO: update author based on selected host
          : `${currentAccount.name}/${parentAuthor}/${parentPermlink}`, // different draftId for each user acount
      [mode, currentAccount.name, parentAuthor, parentPermlink],
    );

    // Use specific reply selector for waves and quick replies
    const currentDraft = useAppSelector((state: RootState) => selectReplyById(draftId)(state)) as
      | Draft
      | undefined;

    const pollDraft = draftId && pollDraftsMap[draftId];

    const bodyLengthExceeded = useMemo(
      () => commentValue.length > MAX_BODY_LENGTH && mode === 'wave',
      [commentValue, mode],
    );

    useEffect(() => {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
      const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    // load quick comment value from cache using memoized draft lookup
    useEffect(() => {
      let _value = '';
      if (currentDraft && currentAccount.name === currentDraft.author) {
        _value = currentDraft.body || '';
      }

      commentValueRef.current = _value;
      setCommentValue(_value);

      const cachedMedia = currentDraft?.meta?.image;
      if (Array.isArray(cachedMedia)) {
        setMediaUrls(cachedMedia);
      } else if (typeof cachedMedia === 'string') {
        setMediaUrls([cachedMedia]);
      } else {
        setMediaUrls([]);
      }

      // check if user can comment to community
      setCommunityToCheck(selectedPost?.community ?? null);
    }, [currentDraft, currentAccount.name, selectedPost?.community]);

    // Check if user can comment based on community data from SDK query
    useEffect(() => {
      if (community) {
        const _canCommentToCommunity = !(
          community.type_id === CommunityTypeId.COUNCIL &&
          community.context?.role === CommunityRole.GUEST
        );
        setCanCommentToCommunity(_canCommentToCommunity);
      } else {
        setCanCommentToCommunity(true);
      }
    }, [community]);

    // add quick comment value into cache - memoized with useCallback
    const _addQuickCommentIntoCache = useCallback(
      (value: string, media: string[] = mediaUrls) => {
        const meta =
          media && media.length > 0
            ? {
                image: media,
              }
            : undefined;

        const quickCommentDraftData: Draft = {
          author: currentAccount.name,
          body: value,
          meta,
        };

        // add quick comment/wave cache entry to replyCache
        dispatch(updateReplyCache(draftId, quickCommentDraftData));
      },
      [currentAccount.name, draftId, dispatch, mediaUrls],
    );

    // Expose imperative handle for sheet close - must come after _addQuickCommentIntoCache
    useImperativeHandle(
      ref,
      () => ({
        handleSheetClose() {
          _addQuickCommentIntoCache(commentValueRef.current || '');
        },
      }),
      [_addQuickCommentIntoCache],
    );

    // handle close press - memoized with useCallback
    const _handleClosePress = useCallback(() => {
      onClose();
    }, [onClose]);

    // navigate to post on summary press - memoized with useCallback
    const _handleOnSummaryPress = useCallback(() => {
      Keyboard.dismiss();
      onClose();
      postsCachePrimer.cachePost(selectedPost);
      RootNavigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author: selectedPost.author,
          permlink: selectedPost.permlink,
        },
        key: get(selectedPost, 'permlink'),
      });
    }, [onClose, postsCachePrimer, selectedPost]);

    // handle submit reply
    const _submitPost = async () => {
      // Prevent double submission with synchronous ref check
      if (isSubmittingRef.current || postSubmitter.isSubmitting) {
        return;
      }

      // Set ref immediately (synchronous) to prevent race condition
      isSubmittingRef.current = true;

      try {
        let _isSuccess = false;
        const _body =
          mediaUrls.length > 0 ? `${commentValue}\n\n ![](${mediaUrls[0]})` : commentValue;

        switch (mode) {
          case 'comment':
            _isSuccess = await postSubmitter.submitReply(_body, selectedPost);
            break;
          case 'wave':
            _isSuccess = await postSubmitter.submitWave(_body, pollDraft);
            break;
          default:
            throw new Error('mode needs implementing');
        }

        if (_isSuccess) {
          // Cancel any pending debounced cache update
          _deboucedCacheUpdate.cancel();
          // delete quick comment/wave cache if it exists
          if (currentDraft) {
            dispatch(deleteReplyCacheEntry(draftId));
          }
          dispatch(removePollDraft(draftId));
          setCommentValue('');
          commentValueRef.current = '';
          onClose();
        } else {
          _addQuickCommentIntoCache(commentValue); // add comment value into cache if there is error while posting comment
        }
      } finally {
        // Always reset ref when done
        isSubmittingRef.current = false;
      }
    };

    const _handleMediaInsert = (data: MediaInsertData[]) => {
      const _insertUrls: string[] = [];

      const _item = data[0];

      if (_item) {
        switch (_item.status) {
          case MediaInsertStatus.READY:
            if (_item.url) {
              _insertUrls.push(_item.url);
            }
            break;
          case MediaInsertStatus.FAILED:
            setIsUploading(false);
            break;
        }
      }

      setMediaModalVisible(false);
      uploadsGalleryModalRef.current?.toggleModal(false);
      setMediaUrls(_insertUrls);
      _addQuickCommentIntoCache(commentValueRef.current || '', _insertUrls);
    };

    const _handleExpandBtn = async () => {
      if (selectedPost) {
        Keyboard.dismiss();
        onClose();
        await delay(50);
        RootNavigation.navigate({
          name: ROUTES.SCREENS.EDITOR,
          key: 'editor_replay',
          params: {
            isReply: true,
            post: selectedPost,
            replyMediaUrls: mediaUrls,
          },
        });
      }
    };

    const _handleMediaBtn = () => {
      if (uploadsGalleryModalRef.current) {
        uploadsGalleryModalRef.current.toggleModal(!mediaModalVisible);
        setMediaModalVisible(!mediaModalVisible);
      }
    };

    const _handlePollBtn = async () => {
      Keyboard.dismiss();
      if (pollWizardModalRef.current) {
        pollWizardModalRef.current.showModal(draftId);
      }
    };

    const _handleAiImageBtn = () => {
      Keyboard.dismiss();
      RootNavigation.navigate({
        name: ROUTES.SCREENS.AI_IMAGE_GENERATOR,
        params: {
          suggestedPrompt: commentValue?.trim() || undefined,
          onInsert: (url: string) => {
            _handleMediaInsert([
              {
                url,
                text: '',
                status: MediaInsertStatus.READY,
              } as MediaInsertData,
            ]);
          },
        },
      });
    };

    const _deboucedCacheUpdate = useMemo(
      () => debounce(_addQuickCommentIntoCache, 500),
      [_addQuickCommentIntoCache],
    );

    const _onChangeText = (value) => {
      commentValueRef.current = value;
      setCommentValue(value);
      _deboucedCacheUpdate(value);
    };

    useEffect(() => {
      return () => {
        _deboucedCacheUpdate.cancel();
      };
    }, [_deboucedCacheUpdate]);

    // VIEW_RENDERERS

    const _renderSummary = () => (
      <TouchableOpacity disabled={mode === 'wave'} onPress={() => _handleOnSummaryPress()}>
        <Text numberOfLines={2} style={styles.summaryStyle}>
          {headerText}
        </Text>
      </TouchableOpacity>
    );

    const _renderAvatar = () => (
      <View style={styles.avatarAndNameContainer}>
        <UserAvatar noAction username={currentAccount.name} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{`@${currentAccount.name}`}</Text>
        </View>

        {!canCommentToCommunity && (
          <PopoverWrapper
            text={intl.formatMessage(
              { id: 'editor.community_comment_restriction' },
              { title: selectedPost?.community_title },
            )}
          >
            <Icon
              iconType="MaterialCommunityIcons"
              name="alert-circle-outline"
              size={24}
              color={EStyleSheet.value('$primaryRed')}
              style={{ marginLeft: 12 }}
            />
          </PopoverWrapper>
        )}
      </View>
    );

    const _renderMediaPanel = () => {
      const _onPress = () => {
        setMediaUrls([]);
        _addQuickCommentIntoCache(commentValueRef.current || '', []);
      };

      const _minusIcon = !isUploading && (
        <View style={styles.minusContainer}>
          <Icon
            color={EStyleSheet.value('$pureWhite')}
            iconType="MaterialCommunityIcons"
            name="minus"
            size={16}
          />
        </View>
      );

      const _mediaThumb = !mediaModalVisible && mediaUrls.length > 0 && (
        <TouchableOpacity onPress={_onPress} disabled={isUploading}>
          <ExpoImage source={{ uri: mediaUrls[0] }} style={styles.mediaItem} />
          {_minusIcon}
        </TouchableOpacity>
      );

      const _uploadingPlaceholder = isUploading && (
        <View style={styles.mediaItem}>
          <ActivityIndicator />
        </View>
      );

      return (
        <Fragment>
          {_mediaThumb}
          {_uploadingPlaceholder}

          <UploadsGalleryModal
            ref={uploadsGalleryModalRef}
            isPreviewActive={false}
            username={currentAccount.name}
            allowMultiple={false}
            hideToolbarExtension={() => {
              setMediaModalVisible(false);
            }}
            handleMediaInsert={_handleMediaInsert}
            setIsUploading={setIsUploading}
          />
        </Fragment>
      );
    };

    const _renderExpandBtn = () => {
      const _lengthTextStyle = {
        ...styles.toolbarSpacer,
        color: EStyleSheet.value(bodyLengthExceeded ? '$primaryRed' : '$iconColor'),
      };

      return (
        <View style={styles.toolbarContainer}>
          <IconButton
            iconType="MaterialsIcons"
            name="image-outline"
            onPress={_handleMediaBtn}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
          />
          <IconButton
            iconType="MaterialCommunityIcons"
            name="creation"
            onPress={_handleAiImageBtn}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
          />
          {mode !== 'wave' && canCommentToCommunity && (
            <IconButton
              iconStyle={styles.toolbarSpacer}
              iconType="MaterialCommunityIcons"
              name="arrow-expand"
              onPress={_handleExpandBtn}
              size={24}
              color={EStyleSheet.value('$primaryBlack')}
            />
          )}

          {mode === 'wave' && (
            <>
              <IconButton
                iconType="SimpleLineIcons"
                style={!!pollDraft && styles.iconBottomBar}
                name="chart"
                onPress={_handlePollBtn}
                size={18}
                color={EStyleSheet.value('$primaryBlack')}
              />
              <Text style={_lengthTextStyle}>{`${commentValue.length}/${MAX_BODY_LENGTH}`}</Text>
            </>
          )}
        </View>
      );
    };

    const _renderReplyBtn = () => {
      const _titleId = mode !== 'comment' ? 'quick_reply.publish' : 'quick_reply.reply';

      return (
        <View style={styles.replyBtnContainer}>
          <TextButton
            style={styles.cancelButton}
            onPress={_handleClosePress}
            text={intl.formatMessage({
              id: 'quick_reply.close',
            })}
          />
          <MainButton
            style={styles.commentBtn}
            onPress={_submitPost}
            text={intl.formatMessage({
              id: _titleId,
            })}
            isDisable={
              isUploading ||
              bodyLengthExceeded ||
              !canCommentToCommunity ||
              postSubmitter.isSubmitting
            }
            isLoading={postSubmitter.isSubmitting}
          />
        </View>
      );
    };

    const _placeholderId =
      mode === 'comment' ? 'quick_reply.placeholder' : 'quick_reply.placeholder_wave';

    // iOS handles bottom margin well when keyboard is visible, for android we rquire this mod to avoid clipping
    const _marginBottom = isKeyboardVisible && Platform.OS !== 'ios' ? insets.bottom || 12 : 0;

    return (
      <View
        style={{
          ...styles.modalContainer,
          marginBottom: _marginBottom,
        }}
      >
        {_renderSummary()}
        {_renderAvatar()}
        <View style={styles.inputContainer}>
          <TextInput
            innerRef={inputRef}
            onChangeText={_onChangeText}
            value={commentValue}
            autoFocus={true}
            placeholder={intl.formatMessage({
              id: _placeholderId,
            })}
            placeholderTextColor="#c1c5c7"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            style={styles.textInput}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {_renderMediaPanel()}

        <View style={styles.footer}>
          {_renderExpandBtn()}
          {_renderReplyBtn()}
        </View>

        <PollWizardModal ref={pollWizardModalRef} />
      </View>
    );
  },
);
