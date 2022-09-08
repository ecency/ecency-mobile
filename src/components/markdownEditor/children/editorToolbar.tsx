import { View } from 'react-native'
import React, { useRef } from 'react'
import { IconButton, StickyBar, UploadsGalleryModal } from '../..'
import { FlatList } from 'react-native-gesture-handler';
import styles from '../styles/editorToolbarStyles';
import { useAppSelector } from '../../../hooks';
import { MediaInsertData } from '../../uploadsGalleryModal/container/uploadsGalleryModal';
import Formats from './formats/formats';

type Props = {
  paramFiles:any[]
  isEditing:boolean,
  setIsUploading: (isUploading: boolean) => void;
  handleMediaInsert: (data: MediaInsertData[]) => void;
  handleOnAddLinkPress: () => void;
  handleOnClearPress: () => void;
  handleOnMarkupButtonPress: (item) => void;
  handleShowSnippets: () => void;
}

export const EditorToolbar = ({
  paramFiles,
  isEditing,
  setIsUploading,
  handleMediaInsert,
  handleOnAddLinkPress,
  handleOnClearPress,
  handleOnMarkupButtonPress,
  handleShowSnippets

}: Props) => {

  const currentAccount = useAppSelector(state => state.account.currentAccount)

  const uploadsGalleryModalRef = useRef<typeof UploadsGalleryModal>(null);


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

  return (
    <StickyBar style={styles.container}>

      <UploadsGalleryModal
        ref={uploadsGalleryModalRef}
        paramFiles={paramFiles}
        isEditing={isEditing}
        username={currentAccount.username}
        handleMediaInsert={handleMediaInsert}
        setIsUploading={setIsUploading}
      />

      <View style={styles.buttonsContainer}>
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
            onPress={() => {
              if (uploadsGalleryModalRef.current) {
                uploadsGalleryModalRef.current.toggleModal();

              }
            }}
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


    </StickyBar>
  )
}