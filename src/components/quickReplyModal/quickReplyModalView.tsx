import React, { useEffect, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { QuickReplyModalContent } from './quickReplyModalContent';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideReplyModal } from '../../redux/actions/uiAction';
import { PostEditorModalData } from '../../redux/reducers/uiReducer';
import styles from './quickReplyModalStyles';

const QuickReplyModal = () => {
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
        onClose={_onClose}
      >
        <QuickReplyModalContent
          ref={modalContentRef}
          mode={replyModalData?.mode || 'comment'}
          selectedPost={replyModalData?.parentPost}
          onClose={_onClose}
        />
      </ActionSheet>
      {backdropVisible && (
        <Animated.View exiting={FadeOut} entering={FadeIn} style={styles.backdrop} />
      )}
    </>
  );
};

export default QuickReplyModal;
