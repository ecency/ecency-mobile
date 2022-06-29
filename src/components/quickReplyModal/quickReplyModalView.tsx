import React, { useImperativeHandle, useRef, useState } from 'react';
import { forwardRef } from 'react';
import { QuickReplyModalContent } from './quickReplyModalContent';
import { InputSupportModal } from '../organisms';

export interface QuickReplyModalProps {
  fetchPost?: any;
}

const QuickReplyModal = ({ fetchPost }: QuickReplyModalProps, ref) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const inputRef = useRef<TextInput>(null);
  const handleCloseRef = useRef(null);

  const [visible, setVisible] = useState(false);

  //CALLBACK_METHOD
  useImperativeHandle(ref, () => ({
    show: (post: any) => {
      setSelectedPost(post);
      setVisible(true)

    },
  }));

  const _onClose = () => {
    setVisible(false);
  }


  return (
    <InputSupportModal
      visible={visible && !!selectedPost}
      onClose={_onClose}
    >
      <QuickReplyModalContent
        fetchPost={fetchPost}
        selectedPost={selectedPost}
        inputRef={inputRef}
        onClose={_onClose}
        handleCloseRef={handleCloseRef}
      />
    </InputSupportModal>

  );
};

export default forwardRef(QuickReplyModal as any);
