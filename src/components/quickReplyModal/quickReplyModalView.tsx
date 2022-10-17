import React, { useRef } from 'react';
import { QuickReplyModalContent } from './quickReplyModalContent';
import { InputSupportModal } from '../organisms';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideReplyModal } from '../../redux/actions/uiAction';

const QuickReplyModal = () => {
  const dispatch = useAppDispatch();

  const replyModalVisible = useAppSelector((state) => state.ui.replyModalVisible);
  const replyModalPost = useAppSelector((state) => state.ui.replyModalPost);
  const modalContentRef = useRef(null);

  const _onClose = () => {
    if (modalContentRef.current) {
      modalContentRef.current.handleSheetClose();
    }
    dispatch(hideReplyModal());
  };

  return (
    <InputSupportModal visible={replyModalVisible && !!replyModalPost} onClose={_onClose}>
      <QuickReplyModalContent
        ref={modalContentRef}
        selectedPost={replyModalPost}
        onClose={_onClose}
      />
    </InputSupportModal>
  );
};

export default QuickReplyModal;
