import React, { useRef } from 'react';
import { QuickReplyModalContent } from './quickReplyModalContent';
import { InputSupportModal } from '../organisms';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideReplyModal } from '../../redux/actions/uiAction';
import { PostEditorModalData } from '../../redux/reducers/uiReducer';

const QuickReplyModal = () => {
  const dispatch = useAppDispatch();

  const replyModalVisible = useAppSelector((state) => state.ui.replyModalVisible);
  const replyModalData: PostEditorModalData = useAppSelector((state) => state.ui.replyModalData);
  const modalContentRef = useRef(null);

  const _onClose = () => {
    if (modalContentRef.current) {
      modalContentRef.current.handleSheetClose();
    }
    dispatch(hideReplyModal());
  };

  return (
    <InputSupportModal visible={replyModalVisible && !!replyModalData} onClose={_onClose}>
      <QuickReplyModalContent
        ref={modalContentRef}
        mode={replyModalData?.mode || 'comment'}
        selectedPost={replyModalData?.parentPost}
        onClose={_onClose}
      />
    </InputSupportModal>
  );
};

export default QuickReplyModal;
