import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, View, ViewStyle } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Animated, {
  Easing,
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IconButton, UploadsGalleryModal, PollsWizardModal } from '../..';
import { useAppSelector } from '../../../hooks';
import { MediaInsertData, Modes } from '../../uploadsGalleryModal/container/uploadsGalleryModal';
import styles from '../styles/editorToolbarStyles';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import EStyleSheet from 'react-native-extended-stylesheet';

type Props = {
  draftId?: string;
  postBody: string;
  paramFiles: any[];
  isEditing: boolean;
  isPreviewActive: boolean;
  setIsUploading: (isUploading: boolean) => void;
  handleMediaInsert: (data: MediaInsertData[]) => void;
  handleOnAddLinkPress: () => void;
  handleOnClearPress: () => void;
  handleOnMarkupButtonPress: (item) => void;
  handleShowSnippets: () => void;
};

export const EditorToolbar = ({
  draftId,
  postBody,
  paramFiles,
  isEditing,
  isPreviewActive,
  setIsUploading,
  handleMediaInsert,
  handleOnAddLinkPress,
  handleOnClearPress,
  handleOnMarkupButtonPress,
  handleShowSnippets,
}: Props) => {

  const navigation = useNavigation();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pollDraft = useAppSelector(state => state.editor.pollDraftsMap[draftId || DEFAULT_USER_DRAFT_ID]);
  
  const uploadsGalleryModalRef = useRef<typeof UploadsGalleryModal>(null);
  const pollsWizardModalRef = useRef(null);
  const extensionHeight = useRef(0);

  const translateY = useSharedValue(200);

  const [isExtensionVisible, setIsExtensionVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // or some other action
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // or some other action
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // const _renderMarkupButton = ({ item }) => (
  //   <View style={styles.buttonWrapper}>
  //     <IconButton
  //       size={20}
  //       style={styles.editorButton}
  //       iconStyle={styles.icon}
  //       iconType={item.iconType}
  //       name={item.icon}
  //       onPress={() => {
  //         handleOnMarkupButtonPress && handleOnMarkupButtonPress(item);
  //       }}
  //     />
  //   </View>
  // );

  const _prepareExtensionToggle = (revealWhenReady, onReady) => {
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
    navigation.navigate(ROUTES.MODALS.POLL_WIZARD, {
      draftId,
    })
    // if (!pollsWizardModalRef.current) {
    //   return;
    // }

    // const _revealWhenReady = !pollsWizardModalRef.current.isVisible();

    // _prepareExtensionToggle(_revealWhenReady, () => {
    //   pollsWizardModalRef.current?.toggleModal(true);
    // });
  };

  const _showImageUploads = () => {
    _showUploadsExtension(Modes.MODE_IMAGE);
  };

  const _showVideoUploads = () => {
    _showUploadsExtension(Modes.MODE_VIDEO);
  };

  const _onPanEnd = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    console.log('finalize', e.velocityY, e.translationY);
    const _shouldHide = e.velocityY > 300 || e.translationY > extensionHeight.current / 2;
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
      pollsWizardModalRef.current?.toggleModal(false);
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
              draftId={draftId}
              ref={uploadsGalleryModalRef}
              postBody={postBody}
              isPreviewActive={isPreviewActive}
              paramFiles={paramFiles}
              isEditing={isEditing}
              username={currentAccount.username}
              hideToolbarExtension={_hideExtension}
              handleMediaInsert={handleMediaInsert}
              setIsUploading={setIsUploading}
            />
            <PollsWizardModal
              ref={pollsWizardModalRef}
              isPreviewActive={isPreviewActive}
              draftId={draftId}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  const _containerStyle: ViewStyle = isExtensionVisible
    ? styles.container
    : styles.shadowedContainer;
  const _buttonsContainerStyle: ViewStyle = {
    ...styles.buttonsContainer,
    borderTopWidth: isExtensionVisible ? 1 : 0,
    paddingBottom: !isKeyboardVisible ? getBottomSpace() : 0,
  };

  return (
    <View style={_containerStyle}>
      {_renderExtension()}

      {!isPreviewActive && (
        <View style={_buttonsContainerStyle}>
          <View style={styles.leftButtonsWrapper}>
            {/* <FlatList
              data={Formats}
              keyboardShouldPersistTaps="always"
              renderItem={({ item, index }) => index < 3 && _renderMarkupButton({ item })}
              horizontal
            /> */}

            <IconButton
              size={22}
              style={styles.rightIcons}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="format-text"
              onPress={() => {
                throw new Error('Add support for formatting toolbar');
              }}
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

            <IconButton
              size={18}
              style={[styles.rightIcons, !!pollDraft && styles.iconBottomBar]}
              iconStyle={styles.icon}
              iconType="SimpleLineIcons"
              name="chart"
              onPress={_showPollsExtension}
            />

            <IconButton
              onPress={_showImageUploads}
              style={styles.rightIcons}
              size={18}
              iconStyle={styles.icon}
              iconType="FontAwesome"
              name="image"
            />
            <IconButton
              onPress={_showVideoUploads}
              style={styles.rightIcons}
              size={26}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="video-outline"
            />
          </View>

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
