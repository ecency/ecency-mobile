import React, { useEffect, useRef, useState } from 'react';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Platform, View } from 'react-native';
import { QuickReplyModalContent } from './quickPostModalContent';
import styles from './quickPostModal.styles';
import { SheetNames } from '../../navigation/sheets';

const QuickPostModal = ({ payload }: SheetProps<SheetNames.QUICK_POST>) => {

  const modalContentRef = useRef(null);
  const { mode, parentPost } = payload || {};



  const _onClose = () => {
    SheetManager.hide(SheetNames.QUICK_POST);

    if (modalContentRef.current) {
      modalContentRef.current.handleSheetClose();
    }

  };

  return (
    <>
      <ActionSheet
        gestureEnabled={true}
        containerStyle={styles.sheetContent}
        indicatorStyle={styles.sheetIndicator}
        defaultOverlayOpacity={0}
        keyboardHandlerEnabled={Platform.OS !== 'android'} // hack to prevent sheet height issue on android
        onClose={_onClose}
      >
        <QuickReplyModalContent
          ref={modalContentRef}
          mode={mode || 'comment'}
          selectedPost={parentPost}
          onClose={_onClose}
        />
      </ActionSheet>
      <View style={styles.backdrop} />
    </>
  );
};

export default QuickPostModal;
