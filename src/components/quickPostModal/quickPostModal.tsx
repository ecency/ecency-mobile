import React, { useEffect, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import { Platform, View } from 'react-native';
import { QuickReplyModalContent } from './quickPostModalContent';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideReplyModal } from '../../redux/actions/uiAction';
import { PostEditorModalData } from '../../redux/reducers/uiReducer';
import styles from './quickPostModal.styles';

const QuickPostModal = () => {
  const dispatch = useAppDispatch();
  const bottomSheetModalRef = useRef();

  const [backdropVisible, setBackdropVisible] = useState(false);

  const replyModalVisible = useAppSelector((state) => state.ui.replyModalVisible);
  const replyModalData: PostEditorModalData = useAppSelector((state) => state.ui.replyModalData);

  const modalContentRef = useRef(null);

  useEffect(() => {
    if (replyModalVisible) {
      setBackdropVisible(true);
      bottomSheetModalRef.current?.show();
    }
  }, [replyModalVisible]);

  const _onClose = () => {
    setBackdropVisible(false);
    bottomSheetModalRef.current?.hide();
    if (modalContentRef.current) {
      modalContentRef.current.handleSheetClose();
    }
    dispatch(hideReplyModal());
  };

  return (
    <>
      <ActionSheet
        ref={bottomSheetModalRef}
        gestureEnabled={true}
        containerStyle={styles.sheetContent}
        indicatorStyle={styles.sheetIndicator}
        defaultOverlayOpacity={0}
        keyboardHandlerEnabled={Platform.OS !== 'android'} // hack to prevent sheet height issue on android
        onClose={_onClose}
      >
        <QuickReplyModalContent
          ref={modalContentRef}
          mode={replyModalData?.mode || 'comment'}
          selectedPost={replyModalData?.parentPost}
          onClose={_onClose}
        />
      </ActionSheet>
      {backdropVisible && <View style={styles.backdrop} />}
    </>
  );
};

export default QuickPostModal;
