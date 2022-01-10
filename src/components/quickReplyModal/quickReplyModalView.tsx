import React, { useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { TextButton, TextInput } from '..';

export interface QuickReplyModalProps {}

const QuickReplyModal = ({}: QuickReplyModalProps, ref) => {
  const intl = useIntl();
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const sheetModalRef = useRef<ActionSheet>();

  //CALLBACK_METHODS
  useImperativeHandle(ref, () => ({
    show: (post: any) => {
      console.log('Showing action modal');
      setSelectedPost(post);
      sheetModalRef.current?.setModalVisible(true);
    },
  }));

  //VIEW_RENDERERS

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text>{selectedPost.title}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={setCommentValue}
            value={commentValue}
            autoFocus
            placeholder={intl.formatMessage({
              id: 'quick_reply.placeholder',
            })}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            style={styles.textInput}
          />
          <TextButton
            text={intl.formatMessage({
              id: 'quick_reply.comment',
            })}
            onPress={() => console.log('Comment!')}
            style={styles.commentBtn}
            textStyle={styles.btnText}
          />
        </View>
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={false}
      hideUnderlay
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      {selectedPost && _renderContent()}
    </ActionSheet>
  );
};

export default forwardRef(QuickReplyModal);
