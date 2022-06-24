import React, { useImperativeHandle, useRef, useState } from 'react';
import { View as AnimatedView } from 'react-native-animatable'
import { forwardRef } from 'react';
import { Portal } from 'react-native-portalize';
import { QuickReplyModalContent } from './quickReplyModalContent';
import styles from './quickReplyModalStyles';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

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

  const _renderContent = () => (
    <QuickReplyModalContent
      fetchPost={fetchPost}
      selectedPost={selectedPost}
      inputRef={inputRef}
      onClose={_onClose}
      handleCloseRef={handleCloseRef}
    />
  )

  return (
    <Portal>
      {
        visible && (
          <AnimatedView
            style={styles.container}
            duration={300}
            animation='fadeInUp'>
            {selectedPost && (
              <>
                <View style={styles.container} onTouchEnd={_onClose} />
                {
                  Platform.select({
                    ios: (
                      <KeyboardAvoidingView style={styles.container} behavior="padding">
                        {_renderContent()}
                      </KeyboardAvoidingView>
                    ),
                    android: <View style={styles.container}>{_renderContent()}</View>,
                  })
                }

              </>
            )}
          </AnimatedView>
        )
      }
    </Portal>
  );
};

export default forwardRef(QuickReplyModal as any);
