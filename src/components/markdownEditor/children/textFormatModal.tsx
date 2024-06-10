import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, FlatList } from 'react-native';
import Formats from './formats/formats';
import { IconButton } from '../..';
import styles from '../styles/editorToolbarStyles';

export interface UploadsGalleryModalRef {
  showModal: () => void;
}

interface TextFormatModalProps {
  isPreviewActive: boolean;
  handleOnMarkupButtonPress: (item: any) => void;
}

export const TextFormatModal = forwardRef(
  ({ isPreviewActive, handleOnMarkupButtonPress }: TextFormatModalProps, ref) => {
    const [showModal, setShowModal] = useState(false);

    useImperativeHandle(ref, () => ({
      toggleModal: (value: boolean) => {
        if (value === showModal) {
          return;
        }

        setShowModal(value);
      },
      isVisible: () => showModal,
    }));

    if (isPreviewActive) {
      return null;
    }

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

    const _renderContent = () => {
      return (
        <FlatList
          style={styles.formatsWrapper}
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={({ item, index }) => index < 3 && _renderMarkupButton({ item })}
          horizontal
        />
      );
    };

    return <>{showModal && _renderContent()}</>;
  },
);
