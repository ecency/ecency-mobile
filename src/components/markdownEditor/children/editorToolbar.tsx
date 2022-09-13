import { Animated, View } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { IconButton, UploadsGalleryModal } from '../..'
import { FlatList, HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import styles from '../styles/editorToolbarStyles';
import { useAppSelector } from '../../../hooks';
import { MediaInsertData } from '../../uploadsGalleryModal/container/uploadsGalleryModal';
import Formats from './formats/formats';

type Props = {
  insertedMediaUrls: string[],
  paramFiles: any[]
  isEditing: boolean,
  isPreviewActive: boolean,
  setIsUploading: (isUploading: boolean) => void;
  handleMediaInsert: (data: MediaInsertData[]) => void;
  handleOnAddLinkPress: () => void;
  handleOnClearPress: () => void;
  handleOnMarkupButtonPress: (item) => void;
  handleShowSnippets: () => void;
}

export const EditorToolbar = ({
  insertedMediaUrls,
  paramFiles,
  isEditing,
  isPreviewActive,
  setIsUploading,
  handleMediaInsert,
  handleOnAddLinkPress,
  handleOnClearPress,
  handleOnMarkupButtonPress,
  handleShowSnippets

}: Props) => {

  const currentAccount = useAppSelector(state => state.account.currentAccount)
  const uploadsGalleryModalRef = useRef<typeof UploadsGalleryModal>(null);
  const translateY = useRef(new Animated.Value(0));
  const shouldHideExtension = useRef(false);

  const [expandExtension, setExpandExtension] = useState(false);
  const [isExtensionVisible, setIsExtensionVisible] = useState(false);

  const _renderMarkupButton = ({ item }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() => { handleOnMarkupButtonPress && handleOnMarkupButtonPress(item) }}
      />
    </View>
  );

  const _showUploadsExtension = () => {
    if (isExtensionVisible && uploadsGalleryModalRef.current) {
      _hideExtension();
    } else if (uploadsGalleryModalRef.current) {
      uploadsGalleryModalRef.current.toggleModal(true);
      _revealExtension(true);
    }
  }


  //handles extension closing
  const _onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationY: translateY.current,
        },
      },
    ]
  );


  const consY = useMemo(()=>translateY.current.interpolate({
    inputRange: [0, Infinity],
    outputRange: [0, Infinity],
    extrapolate: 'clamp'
  }), [translateY.current]);


  const _animatedStyle = {
    transform: [
      {
        translateY: consY,
      },
    ]
  }

  const _onPanHandlerStateChange = (e: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    console.log("handler state change", e.nativeEvent.velocityY, e.nativeEvent.velocityY > 300, e.nativeEvent.translationY);
    shouldHideExtension.current = e.nativeEvent.velocityY > 300 || e.nativeEvent.translationY > 60;
  }

  const _revealExtension = () => {
    if (!isExtensionVisible) {
      translateY.current.setValue(200);
    }

    setIsExtensionVisible(true);
    Animated.timing(translateY.current, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }


  const _hideExtension = () => {
    Animated.timing(translateY.current, {
      toValue: 200,
      duration: 200,
      useNativeDriver: false
    }).start(() => {
      shouldHideExtension.current = false;
      setIsExtensionVisible(false);
      if (uploadsGalleryModalRef.current) {
        uploadsGalleryModalRef.current.toggleModal(false);
      }
    });
  }


  const _onPanEnded = () => {
    if (shouldHideExtension.current) {
      _hideExtension()
    } else {
      _revealExtension();
    }
  }


  const _renderExtension = () => {
    return (
      <PanGestureHandler onGestureEvent={_onGestureEvent}
        onHandlerStateChange={_onPanHandlerStateChange}
        onEnded={_onPanEnded}>
        <Animated.View style={_animatedStyle}>
          <View style={styles.dropShadow}>
            {isExtensionVisible && <View style={styles.indicator} />}
            <UploadsGalleryModal
              ref={uploadsGalleryModalRef}
              insertedMediaUrls={insertedMediaUrls}
              isPreviewActive={isPreviewActive}
              paramFiles={paramFiles}
              isEditing={isEditing}
              username={currentAccount.username}
              handleMediaInsert={handleMediaInsert}
              setIsUploading={setIsUploading}/>
          </View>
        </Animated.View>
      </PanGestureHandler>
    )
  }

  return (
    <View style={isExtensionVisible ? styles.container : styles.shadowedContainer}>

      {_renderExtension()}

      {!isPreviewActive && (
        <View style={{ ...styles.buttonsContainer, borderTopWidth: isExtensionVisible ? 1 : 0 }}>
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
              onPress={() => { handleOnAddLinkPress && handleOnAddLinkPress() }}
            />
            <IconButton
              onPress={() => { handleShowSnippets && handleShowSnippets() }}
              style={styles.rightIcons}
              size={20}
              iconStyle={styles.icon}
              iconType="MaterialCommunityIcons"
              name="text-short"
            />
            <IconButton
              onPress={_showUploadsExtension}
              style={styles.rightIcons}
              size={20}
              iconStyle={styles.icon}
              iconType="FontAwesome"
              name="image"
            />
            <View style={styles.clearButtonWrapper}>
              <IconButton
                onPress={() => { handleOnClearPress && handleOnClearPress() }}
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
  )
}