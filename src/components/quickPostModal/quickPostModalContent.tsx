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
  Alert,
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
import ImagePicker, { Video as VideoType } from 'react-native-image-crop-picker';
import { SheetManager } from 'react-native-actions-sheet';
import styles from './quickPostModal.styles';
import {
  Icon,
  IconButton,
  MainButton,
  PollWizardModal,
  PopoverWrapper,
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
  Modes,
} from '../uploadsGalleryModal/container/uploadsGalleryModal';
import { SpeakUploaderModal } from '../uploadsGalleryModal/children/speakUploaderModal';
import { removePollDraft } from '../../redux/actions/editorActions';
import { SheetNames } from '../../navigation/sheets';
import { CommunityRole, CommunityTypeId } from '../../providers/hive/hive.types';

export interface QuickPostModalContentProps {
  mode: 'comment' | 'wave' | 'post';
  selectedPost?: any;
  paramFiles?: any[];
  onClose: () => void;
}

const MAX_BODY_LENGTH = 250;

export const QuickPostModalContent = forwardRef(
  ({ mode, selectedPost, paramFiles, onClose }: QuickPostModalContentProps, ref) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    const uploadsGalleryModalRef = useRef(null);
    const speakUploaderRef = useRef<any>(null);
    const postsCachePrimer = postQueries.usePostsCachePrimer();
    const postSubmitter = usePostSubmitter();

    const inputRef = useRef<RNTextInput | null>(null);
    const pollWizardModalRef = useRef(null);
    const commentValueRef = useRef('');
    const isSubmittingRef = useRef(false);

    const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null);
    const [videoThumbUrl, setVideoThumbUrl] = useState<string | null>(null);
    const [isVideoUploading, setIsVideoUploading] = useState(false);

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

      // Restore video embed and thumbnail from draft cache
      const cachedVideo = currentDraft?.meta?.video;
      setVideoEmbedUrl(typeof cachedVideo === 'string' ? cachedVideo : null);
      const cachedVideoThumb = currentDraft?.meta?.videoThumb;
      setVideoThumbUrl(typeof cachedVideoThumb === 'string' ? cachedVideoThumb : null);

      // check if user can comment to community
      setCommunityToCheck(selectedPost?.community ?? null);
    }, [currentDraft, currentAccount.name, selectedPost?.community]);

    // Split shared files into media items (for UploadsGalleryModal) and text
    // items (pre-filled into the composer). Without this split, text/url shares
    // would produce null entries in the media pipeline.
    const sharedMediaFiles = useMemo(() => {
      if (!Array.isArray(paramFiles)) return [];
      return paramFiles.filter((el) => el && el.filePath && el.fileName);
    }, [paramFiles]);

    useEffect(() => {
      if (!Array.isArray(paramFiles)) return;
      const textParts: string[] = [];
      paramFiles.forEach((el) => {
        if (!el) return;
        if (el.text) textParts.push(el.text);
        if (el.weblink) textParts.push(el.weblink);
      });
      if (textParts.length > 0) {
        const joined = textParts.join('\n');
        commentValueRef.current = joined;
        setCommentValue(joined);
      }
    }, [paramFiles]);

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
      (
        value: string,
        media: string[] = mediaUrls,
        videoUrl: string | null = videoEmbedUrl,
        thumbUrl: string | null = videoThumbUrl,
      ) => {
        const meta: Record<string, any> = {};
        if (media && media.length > 0) {
          meta.image = media;
        }
        if (videoUrl) {
          meta.video = videoUrl;
        }
        if (thumbUrl) {
          meta.videoThumb = thumbUrl;
        }

        const quickCommentDraftData: Draft = {
          author: currentAccount.name,
          body: value,
          meta: Object.keys(meta).length > 0 ? meta : undefined,
        };

        // add quick comment/wave cache entry to replyCache
        dispatch(updateReplyCache(draftId, quickCommentDraftData));
      },
      [currentAccount.name, draftId, dispatch, mediaUrls, videoEmbedUrl, videoThumbUrl],
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
        let _body = commentValue;
        if (videoEmbedUrl) {
          _body = `${_body}\n\n${videoEmbedUrl}`;
        } else if (mediaUrls.length > 0) {
          _body = `${_body}\n\n ![](${mediaUrls[0]})`;
        }

        switch (mode) {
          case 'comment':
            _isSuccess = await postSubmitter.submitReply(_body, selectedPost);
            break;
          case 'wave':
            _isSuccess = await postSubmitter.submitWave(_body, pollDraft, videoThumbUrl);
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
          setMediaUrls([]);
          setVideoEmbedUrl(null);
          setVideoThumbUrl(null);
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

    const _openVideoPicker = () => {
      ImagePicker.openPicker({
        mediaType: 'video',
        smartAlbums: ['UserLibrary', 'Favorites', 'Videos'],
      })
        .then((video: VideoType) => {
          speakUploaderRef.current?.showUploader(video);
        })
        .catch((e: any) => {
          if (e?.code === 'E_PICKER_CANCELLED') return;
          console.warn('Video picker failed', e);
        });
    };

    const _openVideoCamera = () => {
      ImagePicker.openCamera({
        mediaType: 'video',
      })
        .then((video: VideoType) => {
          speakUploaderRef.current?.showUploader(video);
        })
        .catch((e: any) => {
          if (e?.code === 'E_PICKER_CANCELLED') return;
          console.warn('Video camera failed', e);
        });
    };

    const _handleVideoBtn = () => {
      Keyboard.dismiss();
      Alert.alert(intl.formatMessage({ id: 'video-upload.select_source' }), undefined, [
        {
          text: intl.formatMessage({ id: 'video-upload.record' }),
          onPress: _openVideoCamera,
        },
        {
          text: intl.formatMessage({ id: 'video-upload.choose_library' }),
          onPress: _openVideoPicker,
        },
        {
          text: intl.formatMessage({ id: 'alert.cancel' }),
          style: 'cancel',
        },
      ]);
    };

    const _handleVideoUploaded = (embedUrl: string, thumbUrl?: string) => {
      setVideoEmbedUrl(embedUrl);
      setVideoThumbUrl(thumbUrl || null);
      _addQuickCommentIntoCache(
        commentValueRef.current || '',
        mediaUrls,
        embedUrl,
        thumbUrl || null,
      );
    };

    const _handleRemoveVideo = () => {
      setVideoEmbedUrl(null);
      setVideoThumbUrl(null);
      _addQuickCommentIntoCache(commentValueRef.current || '', mediaUrls, null, null);
    };

    const _handleAiImageBtn = async () => {
      Keyboard.dismiss();
      onClose();
      await delay(50);
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
                mode: Modes.MODE_IMAGE,
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

    const _handleAiAssistBtn = () => {
      SheetManager.show(SheetNames.AI_ASSIST, {
        payload: {
          text: commentValueRef.current,
          supportedActions: ['improve', 'check_grammar', 'summarize'],
          onApply: (output: string, _action: string) => {
            // Cancel any pending debounced cache update to prevent stale overwrite
            _deboucedCacheUpdate.cancel();
            commentValueRef.current = output;
            setCommentValue(output);
            _addQuickCommentIntoCache(output);
          },
        },
      });
    };

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

    const _renderSummary = () => {
      const _lengthTextStyle = {
        ...styles.charCountText,
        color: EStyleSheet.value(bodyLengthExceeded ? '$primaryRed' : '$iconColor'),
      };

      return (
        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={styles.summaryTouchable}
            disabled={mode === 'wave'}
            onPress={() => _handleOnSummaryPress()}
          >
            <Text numberOfLines={2} style={styles.summaryStyle}>
              {headerText}
            </Text>
          </TouchableOpacity>
          {mode === 'wave' && (
            <Text style={_lengthTextStyle}>{`${commentValue.length}/${MAX_BODY_LENGTH}`}</Text>
          )}
          <TouchableOpacity
            onPress={_handleClosePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              iconType="MaterialCommunityIcons"
              name="close"
              size={22}
              color={EStyleSheet.value('$iconColor')}
            />
          </TouchableOpacity>
        </View>
      );
    };

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

      const _videoPreview = videoEmbedUrl && (
        <TouchableOpacity onPress={_handleRemoveVideo} disabled={isVideoUploading}>
          <View style={[styles.mediaItem, { justifyContent: 'center', alignItems: 'center' }]}>
            <Icon
              iconType="MaterialCommunityIcons"
              name="video-check"
              size={32}
              color={EStyleSheet.value('$primaryBlue')}
            />
            <Text style={{ fontSize: 10, color: EStyleSheet.value('$iconColor'), marginTop: 4 }}>
              {intl.formatMessage({ id: 'uploads_modal.video_attached' })}
            </Text>
          </View>
          {_minusIcon}
        </TouchableOpacity>
      );

      const _videoUploading = isVideoUploading && (
        <View style={styles.mediaItem}>
          <ActivityIndicator />
        </View>
      );

      return (
        <Fragment>
          {_videoPreview}
          {_videoUploading}
          {!videoEmbedUrl && _mediaThumb}
          {!videoEmbedUrl && _uploadingPlaceholder}

          <UploadsGalleryModal
            ref={uploadsGalleryModalRef}
            paramFiles={sharedMediaFiles.length > 0 ? sharedMediaFiles : undefined}
            isPreviewActive={false}
            username={currentAccount.name}
            allowMultiple={false}
            hideToolbarExtension={() => {
              setMediaModalVisible(false);
            }}
            handleMediaInsert={_handleMediaInsert}
            setIsUploading={setIsUploading}
          />

          <SpeakUploaderModal
            ref={speakUploaderRef}
            isUploading={isVideoUploading}
            setIsUploading={setIsVideoUploading}
            onVideoUploaded={_handleVideoUploaded}
            isShort={true}
          />
        </Fragment>
      );
    };

    const _renderExpandBtn = () => {
      return (
        <View style={styles.toolbarContainer}>
          <IconButton
            iconType="MaterialsIcons"
            name="image-outline"
            onPress={_handleMediaBtn}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
          />
          {mode !== 'wave' && canCommentToCommunity && (
            <IconButton
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
                iconType="MaterialCommunityIcons"
                name="video-outline"
                onPress={_handleVideoBtn}
                size={24}
                color={EStyleSheet.value(videoEmbedUrl ? '$primaryBlue' : '$primaryBlack')}
                disabled={!!videoEmbedUrl || isVideoUploading}
              />
              <IconButton
                iconType="SimpleLineIcons"
                style={!!pollDraft && styles.iconBottomBar}
                name="chart"
                onPress={_handlePollBtn}
                size={18}
                color={EStyleSheet.value('$primaryBlack')}
              />
            </>
          )}
          <IconButton
            iconType="MaterialsIcons"
            name="image-outline"
            onPress={_handleAiImageBtn}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
            badgeCount="AI"
            badgeStyle={styles.aiBadge}
            badgeTextStyle={styles.aiBadgeText}
          />
          <IconButton
            iconType="MaterialCommunityIcons"
            name="creation"
            onPress={_handleAiAssistBtn}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
            badgeCount="AI"
            badgeStyle={styles.aiBadge}
            badgeTextStyle={styles.aiBadgeText}
          />
        </View>
      );
    };

    const _renderReplyBtn = () => {
      const _titleId = mode !== 'comment' ? 'quick_reply.publish' : 'quick_reply.reply';

      return (
        <View style={styles.replyBtnContainer}>
          <MainButton
            style={styles.commentBtn}
            onPress={_submitPost}
            text={intl.formatMessage({
              id: _titleId,
            })}
            isDisable={
              isUploading ||
              isVideoUploading ||
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
