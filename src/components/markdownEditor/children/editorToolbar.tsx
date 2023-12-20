import { Alert, Keyboard, View, ViewStyle } from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Animated, { Easing, Extrapolation, interpolate, runOnJS, useAnimatedGestureHandler, useSharedValue, withTiming } from 'react-native-reanimated';
import { IconButton, UploadsGalleryModal } from '../..';
import styles from '../styles/editorToolbarStyles';
import { useAppSelector } from '../../../hooks';
import { MediaInsertData, Modes } from '../../uploadsGalleryModal/container/uploadsGalleryModal';
import Formats from './formats/formats';

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
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const uploadsGalleryModalRef = useRef<typeof UploadsGalleryModal>(null);
  const shouldHideExtension = useRef(false);
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

  const _renderMarkupButton = ({ item }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() => {
          handleOnMarkupButtonPress && handleOnMarkupButtonPress(item);
        }}
      />
    </View>
  );

  const _showUploadsExtension = (mode: Modes) => {
    if (!uploadsGalleryModalRef.current) {
      return;
    }

    const _curMode = uploadsGalleryModalRef.current.getMode();

    if (!isExtensionVisible || _curMode !== mode) {
      uploadsGalleryModalRef.current.toggleModal(true, mode);
      _revealExtension();
      return;
    }

    _hideExtension();
  };

  const _showImageUploads = () => {
    _showUploadsExtension(Modes.MODE_IMAGE);
  };

  const _showVideoUploads = () => {
    _showUploadsExtension(Modes.MODE_VIDEO);
  };

  // handles extension closing
  // const _onGestureEvent = Animated.event(
  //   [
  //     {
  //       nativeEvent: {
  //         translationY: translateY,
  //       },
  //     },
  //   ],
  //   {
  //     useNativeDriver: false,
  //   },
  // );

  // const _onGestureEvent = useAnimatedGestureHandler({
  //   onStart: (_, ctx) => {
  //     ctx.startX = x.value;
  //   },
  //   onActive: (event, ctx) => {
  //     x.value = ctx.startX + event.translationX;
  //   },
  //   onEnd: (_) => {
  //     x.value = withSpring(0);
  //   },
  // });

  // const consY = useMemo(
  //   () =>
  //     interpolate(translateY.value,
  //       [0, 500],
  //        [0, 500],
  //       Extrapolation.CLAMP,
  //     ),
  //   [translateY],
  // );

  const _animatedStyle = {
    transform: [
      {
        translateY: translateY,
      },
    ],
  };

  const _onPanHandlerStateChange = (e: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    console.log(
      'handler state change',
      e.nativeEvent.velocityY,
      e.nativeEvent.velocityY > 300,
      e.nativeEvent.translationY,
    );
    shouldHideExtension.current =
      e.nativeEvent.velocityY > 300 || e.nativeEvent.translationY > extensionHeight.current / 2;
  };

  const _revealExtension = () => {
    if (!isExtensionVisible) {
      translateY.value = 200
    }

    setIsExtensionVisible(true);

    translateY.value = withTiming(0, {
      duration: 200,
      easing: Easing.inOut(Easing.ease)
    })
  };


  const _hideExtension = () => {

    const _onComplete = () => {
      setIsExtensionVisible(false)
      if (uploadsGalleryModalRef.current) {
        uploadsGalleryModalRef.current.toggleModal(false);
      }
    }

    translateY.value = withTiming(extensionHeight.current, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    }, (success) => {
      if (success) {
        runOnJS(_onComplete)();
      }
    })
  };
  

  // const _onPanEnded = () => {
  //   if (shouldHideExtension.current) {
  //     _hideExtension();
  //   } else {
  //     _revealExtension();
  //   }
  // };

  const _renderExtension = () => {
    return (
      // <PanGestureHandler
      //   onGestureEvent={_onGestureEvent}
      //   onHandlerStateChange={_onPanHandlerStateChange}
      //   onEnded={_onPanEnded}
      // >
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
        </View>
      </Animated.View>
      // </PanGestureHandler>
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
