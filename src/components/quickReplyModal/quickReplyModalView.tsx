import React, { useEffect, useRef } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import { QuickReplyModalContent } from './quickReplyModalContent';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideReplyModal } from '../../redux/actions/uiAction';
import { PostEditorModalData } from '../../redux/reducers/uiReducer';
import styles from './quickReplyModalStyles';

const QuickReplyModal = () => {
  const dispatch = useAppDispatch();
  const bottomSheetModalRef = useRef();

  const replyModalVisible = useAppSelector((state) => state.ui.replyModalVisible);
  const replyModalData: PostEditorModalData = useAppSelector((state) => state.ui.replyModalData);
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (replyModalVisible) {
      bottomSheetModalRef.current?.show();
    }
  }, [replyModalVisible]);

  const _onClose = () => {
    bottomSheetModalRef.current?.hide();
    if (modalContentRef.current) {
      modalContentRef.current.handleSheetClose();
    }
    dispatch(hideReplyModal());
  };

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
      defaultOverlayOpacity={0}
      elevation={50}
      onClose={_onClose}
    >
      <QuickReplyModalContent
        ref={modalContentRef}
        mode={replyModalData?.mode || 'comment'}
        selectedPost={replyModalData?.parentPost}
        onClose={_onClose}
      />
    </ActionSheet>
  );
};

export default QuickReplyModal;
