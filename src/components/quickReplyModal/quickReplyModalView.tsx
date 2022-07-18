import React, { useRef } from 'react';
import { QuickReplyModalContent } from './quickReplyModalContent';
import { InputSupportModal } from '../organisms';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideReplyModal } from '../../redux/actions/uiAction';

const QuickReplyModal = () => {

  const dispatch = useAppDispatch();

  const replyModalVisible = useAppSelector((state) => state.ui.replyModalVisible);
  const replyModalPost = useAppSelector(state => state.ui.replyModalPost)
  const handleCloseRef = useRef(null);


  const _onClose = () => {
    dispatch(hideReplyModal());
  }


  return (
    <InputSupportModal
      visible={replyModalVisible && !!replyModalPost}
      onClose={_onClose}
    >
      <QuickReplyModalContent
        selectedPost={replyModalPost}
        onClose={_onClose}
        handleCloseRef={handleCloseRef}
      />
    </InputSupportModal>

  );
};

export default QuickReplyModal;
