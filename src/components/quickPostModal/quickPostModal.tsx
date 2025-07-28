import React, { useRef } from 'react';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { View, Platform } from 'react-native';
import { QuickPostModalContent } from './quickPostModalContent';
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
        onClose={_onClose}
      >
        <QuickPostModalContent
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
