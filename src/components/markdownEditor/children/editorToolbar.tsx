import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Keyboard,
  View,
  ViewStyle,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useIntl } from 'react-intl';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import { hasThreeSpeakEmbed } from '@ecency/sdk';
import { IconButton, UploadsGalleryModal } from '../..';
import { hasClipboardImage as detectClipboardImage } from '../../../utils/clipboard';
import { deriveQuestChipState } from '../../../utils/questChip';
import { useAppSelector, useAuth } from '../../../hooks';
import { useGetQuestsQuery } from '../../../providers/queries/pointQueries';
import { SheetNames } from '../../../navigation/sheets';
import {
  MediaInsertData,
  MediaInsertStatus,
  Modes,
} from '../../uploadsGalleryModal/container/uploadsGalleryModal';
import styles from '../styles/editorToolbarStyles';
import ROUTES from '../../../constants/routeNames';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import { TextFormatModal } from './textFormatModal';

// Per-account session dismissals for the quest chip; once closed it stays
// hidden for that account until the app restarts.
const questChipDismissedUsers = new Set<string>();

type Props = {
  draftId?: string;
  postBody: string;
  paramFiles: any[];
  isEditing?: boolean;
  isPreviewActive: boolean;
  isEditMode: boolean;
  isReply?: boolean;
  suggestedPrompt?: string;
  setIsUploading: (isUploading: boolean) => void;
  handleMediaInsert: (data: MediaInsertData[]) => void;
  handleVideoThumb?: (embedUrl: string, thumbUrl: string) => void;
  /** Reads the live body. `postBody` is only as fresh as the last render. */
  getPostBody?: () => string;
  handleOnAddLinkPress: () => void;
  handleOnClearPress: () => void;
  handleOnMarkupButtonPress: (item: any) => void;
  handleShowSnippets: () => void;
  handleAiAssistResult?: (output: string, action: string) => void;
  handleAiToolUsed?: (key: string) => void;
  handleShowTranslate?: () => void;
  handleOnDictationResult?: (text: string) => void;
};

export const EditorToolbar = ({
  draftId,
  postBody,
  paramFiles,
  isEditing,
  isPreviewActive,
  isEditMode,
  isReply,
  suggestedPrompt,
  setIsUploading,
  handleMediaInsert,
  handleVideoThumb,
  getPostBody,
  handleAiToolUsed,
  handleOnAddLinkPress,
  handleOnClearPress,
  handleOnMarkupButtonPress,
  handleShowSnippets,
  handleAiAssistResult,
  handleShowTranslate,
  handleOnDictationResult,
}: Props) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const intl = useIntl();

  const pollDraft = useAppSelector(
    (state) => state.editor.pollDraftsMap[draftId || DEFAULT_USER_DRAFT_ID],
  );

  const { username } = useAuth();
  const { data: questsData } = useGetQuestsQuery(isReply || isEditMode ? undefined : username);

  const uploadsGalleryModalRef = useRef<any>(null);
  const textFormatModalRef = useRef<any>(null);
  const extensionHeight = useRef(0);

  const translateY = useSharedValue(200);

  const [isExtensionVisible, setIsExtensionVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasClipboardImage, setHasClipboardImage] = useState(false);
  const [isQuestChipDismissed, setIsQuestChipDismissed] = useState(
    !!username && questChipDismissedUsers.has(username),
  );
  const dismissedClipboardRef = useRef(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true); // or some other action
      setKeyboardHeight(
        e.endCoordinates.height + Platform.select({ android: insets.bottom, default: 0 }),
      );
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (_) => {
      setKeyboardVisible(false); // or some other action
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Detect images in the clipboard so we can offer a quick paste affordance
  // without keeping a dedicated toolbar icon. Re-checks on mount and whenever
  // the app returns to the foreground (typical copy → switch back flow).
  // Once dismissed, stays dismissed for this composer instance.
  useEffect(() => {
    const checkClipboard = async () => {
      if (dismissedClipboardRef.current) {
        return;
      }
      const has = await detectClipboardImage();
      setHasClipboardImage(has);
    };
    checkClipboard();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkClipboard();
      }
    });
    return () => sub.remove();
  }, []);

  const _prepareExtensionToggle = (revealWhenReady: any, onReady: any) => {
    const _runRevealRoutine = () => {
      if (revealWhenReady) {
        onReady();
        _revealExtension();
      }
    };
    if (isExtensionVisible) {
      _hideExtension(_runRevealRoutine);
    } else {
      _runRevealRoutine();
    }
  };

  const _showUploadsExtension = async (mode: Modes) => {
    if (!uploadsGalleryModalRef.current) {
      return;
    }

    const _isThisVisible = uploadsGalleryModalRef.current.isVisible();
    const _curMode = uploadsGalleryModalRef.current.getMode();

    const _revealWhenReady = !_isThisVisible || _curMode !== mode;

    _prepareExtensionToggle(_revealWhenReady, () => {
      uploadsGalleryModalRef.current.toggleModal(true, mode);
    });
  };

  const _showPollsExtension = async () => {
    (navigation as any).navigate(ROUTES.MODALS.POLL_WIZARD, {
      draftId,
    });
  };

  const _showImageUploads = () => {
    _showUploadsExtension(Modes.MODE_IMAGE);
  };

  const _pasteImageFromClipboard = () => {
    setHasClipboardImage(false);
    dismissedClipboardRef.current = true;
    uploadsGalleryModalRef.current?.pasteImageFromClipboard?.();
  };

  const _dismissClipboardChip = () => {
    setHasClipboardImage(false);
    dismissedClipboardRef.current = true;
  };

  const _dismissQuestChip = () => {
    if (username) {
      questChipDismissedUsers.add(username);
    }
    setIsQuestChipDismissed(true);
  };

  const _openPerks = () => {
    (navigation as any).navigate(ROUTES.SCREENS.PERKS);
  };

  const _showDictation = () => {
    SheetManager.show(SheetNames.DICTATION, {
      payload: {
        onInsert: (text: string) => handleOnDictationResult?.(text),
      },
    });
  };

  const _showAiAssist = () => {
    SheetManager.show(SheetNames.AI_ASSIST, {
      payload: {
        text: postBody,
        onApply: handleAiAssistResult,
      },
    });
  };

  const _showAiImageGenerator = () => {
    (navigation as any).navigate({
      name: ROUTES.SCREENS.AI_IMAGE_GENERATOR,
      params: {
        suggestedPrompt: suggestedPrompt || undefined,
        onInsert: (url: string) => {
          // Pre-check the AI-usage disclosure: this image was generated by Ecency's AI.
          handleAiToolUsed?.('media_generation');
          handleMediaInsert([
            {
              url,
              text: '',
              status: MediaInsertStatus.READY,
              mode: Modes.MODE_IMAGE,
            },
          ]);
        },
      },
    });
  };

  const _showVideoUploads = () => {
    // One 3Speak video per post, matching web. The threespeakfund beneficiary is a single
    // flat share on the post, so a second video would publish without its own payout route.
    if (hasThreeSpeakEmbed(getPostBody?.() ?? postBody ?? '')) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.notice' }),
        intl.formatMessage({ id: 'video-upload.error-one-per-post' }),
      );
      return;
    }
    _showUploadsExtension(Modes.MODE_VIDEO);
  };

  const _showTextFormatModal = () => {
    if (!textFormatModalRef.current) {
      return;
    }

    const _revealWhenReady = !textFormatModalRef.current.isVisible();

    _prepareExtensionToggle(_revealWhenReady, () => {
      textFormatModalRef.current?.toggleModal(true);
    });
  };

  const _onPanEnd = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    console.log('finalize', e.velocityY, e.translationY);

    // if grab point is top handle or modal content is scrolled to top, allose close
    const _allowClose = e.y < 44 || uploadsGalleryModalRef.current?.isScrolledTop();
    // hide extenstion is close is allowed and either velocity is good are modal grapped to half of extensin height
    const _shouldHide =
      _allowClose && (e.velocityY > 300 || e.translationY > extensionHeight.current / 2);

    if (_shouldHide) {
      _hideExtension();
    } else {
      _revealExtension();
    }
  };

  const _gestureHandler = Gesture.Pan()
    .onChange((e) => {
      translateY.value = e.translationY;
    })
    .onFinalize((e) => {
      runOnJS(_onPanEnd)(e);
    });

  const _animatedStyle = useAnimatedStyle(() => {
    // Clamp the interpolated value to a specific range
    return {
      transform: [{ translateY: clamp(translateY.value, 0, 500) }],
    };
  });

  const _revealExtension = () => {
    if (!isExtensionVisible) {
      translateY.value = 200;
    }

    setIsExtensionVisible(true);

    translateY.value = withTiming(0, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  };

  // make is async method
  const _hideExtension = (onComplete?: () => void) => {
    const _onComplete = () => {
      console.log('EXTENSION HIDDEN');
      setIsExtensionVisible(false);
      uploadsGalleryModalRef.current?.toggleModal(false);
      textFormatModalRef.current?.toggleModal(false);
      // TODO: hide formatting extension here

      if (onComplete) {
        console.log('calling on complete');
        onComplete();
      }
    };

    translateY.value = withTiming(
      extensionHeight.current,
      {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      },
      (success) => {
        if (success) {
          runOnJS(_onComplete)();
        }
      },
    );
  };

  const _renderExtension = () => {
    return (
      <GestureDetector gesture={_gestureHandler}>
        <Animated.View style={_animatedStyle}>
          <View
            onLayout={(e) => {
              extensionHeight.current = e.nativeEvent.layout.height;
              console.log('extension height', extensionHeight.current);
            }}
            style={styles.dropShadow}
          >
            {isExtensionVisible && <View style={styles.indicator} />}
            <UploadsGalleryModal
              ref={uploadsGalleryModalRef}
              postBody={postBody}
              isPreviewActive={isPreviewActive}
              paramFiles={paramFiles}
              isEditing={!!isEditing}
              hideToolbarExtension={_hideExtension}
              handleMediaInsert={handleMediaInsert}
              onVideoThumb={handleVideoThumb}
              setIsUploading={setIsUploading}
            />
            <TextFormatModal
              ref={textFormatModalRef}
              isPreviewActive={isPreviewActive}
              handleOnMarkupButtonPress={handleOnMarkupButtonPress}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  const _containerStyle: ViewStyle = isExtensionVisible
    ? styles.container
    : styles.shadowedContainer;

  const _keyboardAdjustedStyle = {
    ..._containerStyle,
    marginBottom: Platform.OS === 'android' && Platform.Version < 35 ? 0 : keyboardHeight,
  };

  const _buttonsContainerStyle: ViewStyle = {
    ...styles.buttonsContainer,
    borderTopWidth: isExtensionVisible ? 1 : 0,
    paddingBottom: !isKeyboardVisible ? insets.bottom : 0,
  };

  const _renderClipboardChip = () => {
    if (!hasClipboardImage || isPreviewActive || isExtensionVisible) {
      return null;
    }
    return (
      <View style={styles.clipboardChipWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={_pasteImageFromClipboard}
          style={styles.clipboardChip}
        >
          <Text style={styles.clipboardChipText}>
            {intl.formatMessage({ id: 'editor.clipboard_image_detected' })} ·{' '}
            {intl.formatMessage({ id: 'editor.paste_image' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_dismissClipboardChip}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clipboardChipClose}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({ id: 'alert.cancel' })}
        >
          <Text style={styles.clipboardChipText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderQuestChip = () => {
    const questChip = deriveQuestChipState(questsData);
    const clipboardChipVisible = hasClipboardImage && !dismissedClipboardRef.current;
    if (
      isReply ||
      isEditMode ||
      isQuestChipDismissed ||
      isPreviewActive ||
      isExtensionVisible ||
      clipboardChipVisible ||
      !questChip?.visible
    ) {
      return null;
    }

    const parts = [
      `${intl.formatMessage({ id: 'quest_chip.daily_post' })} ${questChip.postProgress}/${
        questChip.postGoal
      }`,
    ];
    if (questChip.streakCurrent > 0) {
      parts.push(
        `🔥 ${intl.formatMessage({ id: 'quest_chip.streak' }, { n: questChip.streakCurrent })}`,
      );
    }
    if (questChip.atRisk) {
      parts.push(intl.formatMessage({ id: 'quest_chip.keep_streak' }));
    }

    const _textStyle = [styles.questChipText, questChip.atRisk && styles.questChipTextAtRisk];

    return (
      <View style={styles.questChipWrapper}>
        <TouchableOpacity activeOpacity={0.8} onPress={_openPerks} style={styles.questChip}>
          <Text style={_textStyle}>{parts.join(' · ')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_dismissQuestChip}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.questChipClose}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({ id: 'alert.cancel' })}
        >
          <Text style={_textStyle}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={_keyboardAdjustedStyle}>
      {_renderExtension()}
      {_renderClipboardChip()}
      {_renderQuestChip()}

      {!isPreviewActive && (
        <View style={_buttonsContainerStyle}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.leftButtonsWrapper}
            keyboardShouldPersistTaps="always"
          >
            <IconButton
              size={22}
              style={styles.rightIcons}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="format-text"
              onPress={_showTextFormatModal}
            />

            <IconButton
              size={18}
              style={styles.rightIcons}
              iconStyle={styles.icon}
              iconType="FontAwesome"
              name="link"
              onPress={() => {
                handleOnAddLinkPress && handleOnAddLinkPress();
              }}
            />
            <IconButton
              onPress={() => {
                handleShowSnippets && handleShowSnippets();
              }}
              style={styles.rightIcons}
              size={20}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="text-short"
            />

            {!isEditMode && (
              <IconButton
                size={18}
                style={[styles.rightIcons, !!pollDraft?.title && styles.iconBottomBar]}
                iconStyle={styles.icon}
                iconType="SimpleLineIcons"
                name="chart"
                onPress={_showPollsExtension}
              />
            )}

            <IconButton
              onPress={_showImageUploads}
              onLongPress={_pasteImageFromClipboard}
              style={styles.rightIcons}
              size={18}
              iconStyle={styles.icon}
              iconType="FontAwesome"
              name="image"
            />
            <IconButton
              onPress={_showAiImageGenerator}
              style={styles.rightIcons}
              size={18}
              iconStyle={styles.icon}
              iconType="FontAwesome"
              name="image"
              badgeCount="AI"
              badgeStyle={styles.aiBadge}
              badgeTextStyle={styles.aiBadgeText}
            />
            <IconButton
              onPress={_showAiAssist}
              style={styles.rightIcons}
              size={18}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="creation"
              badgeCount="AI"
              badgeStyle={styles.aiBadge}
              badgeTextStyle={styles.aiBadgeText}
            />
            <IconButton
              onPress={() => {
                handleShowTranslate && handleShowTranslate();
              }}
              style={styles.rightIcons}
              size={18}
              iconStyle={styles.icon}
              iconType="MaterialIcons"
              name="translate"
            />
            <IconButton
              onPress={_showVideoUploads}
              style={styles.rightIcons}
              size={26}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="video-outline"
            />
            <IconButton
              onPress={_showDictation}
              style={styles.rightIcons}
              size={22}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="microphone-outline"
              badgeCount="AI"
              badgeStyle={styles.aiBadge}
              badgeTextStyle={styles.aiBadgeText}
            />
          </ScrollView>

          <View style={styles.rightButtonsWrapper}>
            <View style={styles.clearButtonWrapper}>
              <IconButton
                onPress={() => {
                  handleOnClearPress && handleOnClearPress();
                }}
                size={20}
                iconStyle={styles.clearIcon}
                iconType="FontAwesome"
                name="trash"
                backgroundColor={styles.clearButtonWrapper.backgroundColor}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
